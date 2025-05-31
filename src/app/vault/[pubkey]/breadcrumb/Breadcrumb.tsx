import Link from "next/link";

export interface BreadcrumbProps {
  name: string;
  token: {
    icon: string;
    name: string;
  };
}

export const Breadcrumb = ({ name, token }: BreadcrumbProps) => {
  return (
    <div className="flex items-center gap-2">
      <Link
        href="/vaults"
        className="bg-gray-900 shadow-sm rounded-lg flex flex-col p-1.5"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          className="w-6 h-6"
          viewBox="0 0 24 24"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 12H5m6 6-6-6 6-6"
          ></path>
        </svg>
      </Link>
      <div className="flex items-center gap-1">
        <img
          src={token.icon}
          alt={token.name}
          className="w-6 h-6 rounded-full"
        />
        <h2 className="text-2xl font-bold">{name}</h2>
      </div>
    </div>
  );
};

export default Breadcrumb;
