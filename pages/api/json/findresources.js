import fetchResourcesJSON from "./resources";
import compareVersions from "../compareVersions";

/**
 * @helper
 * @description Calculates the Damerau-Levenshtein distance between two strings. Used for fuzzy search.
 * @returns {number} The Damerau-Levenshtein distance between the two strings.
 */
function damerauLevenshteinDistance(a, b) {
  if (a.length == 0) return b.length;
  if (b.length == 0) return a.length;
  var matrix = [];
  for (var i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (var j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (i = 1; i <= b.length; i++) {
    for (j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
        if (
          i > 1 &&
          j > 1 &&
          b.charAt(i - 1) == a.charAt(j - 2) &&
          b.charAt(i - 2) == a.charAt(j - 1)
        ) {
          matrix[i][j] = Math.min(
            matrix[i][j],
            matrix[i - 2][j - 2] + 1 // transposition
          );
        }
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * @helper
 * @async
 * @description Fetches the resources based on the query object from the JSON file.
 * @param {json} queryObject The query object.
 * @returns {JSX.Element} The JSX element to be rendered.
 */
export default async function getResourcesJSON(queryObject, currentPage, pageSize, database) {
  const resources = await fetchResourcesJSON(database);
  const query = queryObject.query.trim();
  const keywords = query.split(" ");
  let results = resources.filter((resource) => {
    let idMatches = keywords.filter((keyword) =>
      resource.id.toLowerCase().includes(keyword.toLowerCase())
    ).length;

    let tagMatches = keywords.filter((keyword) => {
      return resource.tags ? resource.tags.includes(keyword.toLowerCase()) : false;
    }).length;

    let descMatches = keywords.filter((keyword) =>
      resource.description.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    let resMatches = 0;
    if (resource.resources) {
      // only search if resource.resources exists
      const resourceJSON = JSON.stringify(resource.resources).toLowerCase();
      resMatches = keywords.filter((keyword) =>
        resourceJSON.includes(keyword.toLowerCase())
      ).length;
    }
    let totalMatches = idMatches + descMatches + resMatches + tagMatches;
    if (totalMatches === 0) {
      let idDistances = keywords.map((keyword) => {
        const keywordLower = keyword.toLowerCase();
        return Math.min(
          ...resource.id
            .toLowerCase()
            .split("-")
            .map((idPart) => damerauLevenshteinDistance(keywordLower, idPart))
        );
      });
      idMatches = idDistances.filter((d) => d < 3).length;

      if (resource.resources) {
        // only search if resource.resources exists
        const resourceJSON = JSON.stringify(resource.resources).toLowerCase();
        resMatches = keywords.filter((keyword) =>
          resourceJSON.includes(keyword.toLowerCase())
        ).length;
      }
      totalMatches = idMatches + descMatches + resMatches;
    }
    resource["totalMatches"] = totalMatches;
    resource["score"] = query === resource['id'] ? 90 : (idMatches * 2 + descMatches + resMatches / 5) * 7;
    return totalMatches > 0;
  });
  results.forEach((resource) => {
    let aVersion = resource.gem5_versions[0];
    for (let version in resource.gem5_versions) {
      if (compareVersions(resource.gem5_versions[version], aVersion) > 0) {
        aVersion = resource.gem5_versions[version];
      }
    }
    resource.ver_latest = aVersion;
  });

  // remove duplicate ids and keep the one with the highest ver_latest
  let tempResults = results;
  for (let i = 0; i < tempResults.length; i++) {
    for (let j = i + 1; j < tempResults.length; j++) {
      if (tempResults[i].id === tempResults[j].id) {
        if (compareVersions(tempResults[i].ver_latest, tempResults[j].ver_latest) >= 0) {
          results.splice(j, 1);
        } else {
          results.splice(i, 1);
        }
      }
    }
  }

  if (queryObject.sort) {
    switch (queryObject.sort) {
      case "id_asc":
        results = results.sort((a, b) => a.id.localeCompare(b.id));
        break;
      case "id_desc":
        results = results.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "version":
        results = results.sort((a, b) => {
          return compareVersions(b.ver_latest, a.ver_latest);
        });
        break;
      default:
        results = results.sort((a, b) => b.totalMatches - a.totalMatches);
    }
  } else {
    results = results.sort((a, b) => b.totalMatches - a.totalMatches);
  }
  for (let filter in queryObject) {
    if (filter === "tags") {
      results = results.filter((resource) => {
        for (let tag in queryObject[filter]) {
          if (!resource.tags) return false;
          if (resource.tags.includes(queryObject[filter][tag])) {
            return true;
          }
        }
        return false;
      });
    } else if (filter === "gem5_versions") {
      results = results.filter((resource) => {
        for (let version in queryObject[filter]) {
          // check if the version exists in the resource
          for (let gem5Version in resource.gem5_versions) {
            if (
              resource.gem5_versions[gem5Version] ===
              queryObject[filter][version]
            ) {
              return true;
            }
          }
        }
        return false;
      });
    } else if (filter === "architecture" || filter === "category") {
      results = results.filter((resource) =>
        queryObject[filter].includes(String(resource[filter]))
      );
    }
  }
  const total = results.length;
  results = results.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  results.forEach((resource) => {
    resource.database = database;
  });
  return [results, total];
}