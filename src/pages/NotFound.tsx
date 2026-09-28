import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-900">404</p>

        <h1 className="mt-4 text-2xl font-semibold text-gray-900">
          Page not found
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;