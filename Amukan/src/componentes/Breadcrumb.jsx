import React from "react";
import { useLocation, Link } from "react-router-dom";

function generateBreadcrumbs(location) {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const uniqueNames = new Set();
    return pathnames
        .map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join("/")}`;
            if (!uniqueNames.has(value)) {
                uniqueNames.add(value);
                return { name: value, path: to };
            }
            return null;
        })
        .filter(Boolean); // Remove null values
}

export default function Breadcrumb() {
    const location = useLocation();
    const breadcrumbs = generateBreadcrumbs(location);

    return (
        <ol className="flex items-center whitespace-nowrap p-2">
            <li className="inline-flex items-center">
                <Link
                    className="flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:text-blue-500"
                    to="/"
                >
                    <svg
                        className="shrink-0 me-3 size-4"
                        xmlns="http://www.w3.org/2000/svg"
                        width={24}
                        height={24}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                    Home
                </Link>
                <svg
                    className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600"
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="m9 18 6-6-6-6" />
                </svg>
            </li>
            {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.path} className="inline-flex items-center">
                    {index < breadcrumbs.length - 1 ? (
                        <>
                            <Link
                                className="flex items-center text-sm text-gray-500 hover:text-blue-600 focus:outline-none focus:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-500 dark:focus:text-blue-500"
                                to={breadcrumb.path}
                            >
                                {breadcrumb.name}
                            </Link>
                            <svg
                                className="shrink-0 mx-2 size-4 text-gray-400 dark:text-neutral-600"
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="m9 18 6-6-6-6" />
                            </svg>
                        </>
                    ) : (
                        <span
                            className="inline-flex items-center text-sm font-semibold text-gray-800 truncate dark:text-neutral-200"
                            aria-current="page"
                        >
                            {breadcrumb.name}
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
}
