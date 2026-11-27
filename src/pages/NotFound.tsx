import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>404 — Page Not Found | SilentPDF</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-6xl font-bold">404</h1>
          <p className="mt-3 text-lg text-muted-foreground">Oops! Page not found</p>
          <Link to="/" className="mt-6 inline-block text-sm font-medium text-primary underline hover:text-primary/90">
            Return to Home
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
