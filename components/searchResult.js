import Link from "next/link";
import x86 from "/public/x86.png";
import risc_v from "/public/risc_v.png";
import Image from "next/image";
import arm from "/public/arm.png";
import sparc from "/public/sparc.png";
import mips from "/public/mips.png";
import power from "/public/power.png";
import { Badge } from "react-bootstrap";
import invalid from "/public/null.svg";
import { useEffect, useState } from "react";
/**
 * @component
 * @description A component that renders a search result which includes 
 * the resource's name, description, architecture, category and license.
 *  @param {Object} resource The resource to be rendered.
 * @returns {JSX.Element} The JSX element to be rendered.
*/
export default function SearchResult({ resource }) {
    function getIcon(architecture) {
        switch (architecture) {
            case "X86":
                return x86;
            case "RISCV":
                return risc_v;
            case "ARM":
                return arm;
            case "SPARC":
                return sparc;
            case "MIPS":
                return mips;
            case "POWER":
                return power;
            default:
                return invalid;
        }
    }

    return (
        <div className="search-result">
            <Link href={('/resources/' + resource.id) + (resource.database ? "?database=" + resource.database : "")} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="search-result__title d-flex flex-row gap-2 align-items-center">
                    <h4 className="main-text-title-bold text-muted">
                        {resource.database ? `${resource.database} /` : 'gem5-resources /'}
                    </h4>
                    <h4 className="main-text-title-bold">{resource.id}</h4>
                </div>
                <div className="search-result__description">
                    <p className="main-text-regular">{resource.description}</p>
                </div>
                <div className='d-flex gap-3 flex-wrap'>
                    <div className="d-flex gap-1 align-items-center">
                        <Image
                            src={getIcon(resource.architecture)}
                            alt={resource.architecture ?? "Unknown"}
                            width={20}
                            className="mb-3"
                        />
                        <p>
                            {resource.architecture ?? "Unknown"}
                        </p>
                    </div>
                    <div className='d-flex flex-row gap-1'>
                        <p className="text-capitalize font-weight-light main-text-regular">
                            {resource.category}
                        </p>
                    </div>
                    <div className='d-flex flex-row gap-1 main-text-regular'>
                        <h6 style={{ lineHeight: 'inherit', margin: '0' }}>
                            v
                        </h6>
                        {resource.resource_version}
                    </div>
                    <div className='d-flex flex-row gap-1'>
                        {
                            resource.tags ? resource.tags.map((tag, index) => {
                                return (
                                    <div key={index}>
                                        <Badge bg='primary' >
                                            {tag.toUpperCase()}
                                        </Badge>
                                    </div>
                                )
                            }) : ""
                        }
                    </div>
                </div>
            </Link>
        </div>
    )
}