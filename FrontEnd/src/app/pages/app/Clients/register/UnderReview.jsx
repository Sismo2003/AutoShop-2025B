// Import Dependencies
import { Link } from "react-router";
import Confetti from "react-confetti";
import { useState, useEffect, useRef } from "react";

// Local Imports
import { AnimatedTick } from "components/shared/AnimatedTick";
import { Button } from "components/ui";
import { useBoxSize } from "hooks";

// ----------------------------------------------------------------------

export function UnderReview() {
  const ref = useRef(null);
  const { width, height } = useBoxSize({ ref });
  const [run, setRun] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setRun(false);
    }, 3000);
  }, []);

  return (
    <>
      <Confetti
        width={width}
        height={height}
        recycle={run}
        style={{ zIndex: 100 }}
      />
      <div className="h-full text-center">
        <AnimatedTick
          className="mx-auto h-auto w-48 text-success dark:text-success-light"
          strokeWidth={8}
        />

        <p className="mt-6 pt-4 text-xl font-semibold text-gray-800 dark:text-dark-50">
          You Registered a Customer successfully
        </p>
        <p className="mx-auto mt-2 max-w-(--breakpoint-lg) text-balance">
          Thank you for submitting the form. The client should be registered and ready to start using them.
          In case of any issues, please contact support or re do the form.
        </p>
        <Button
          color="primary"
          className="mt-8 w-full px-10 sm:w-auto"
          to="/app/clients/all"
          component={Link}
        >
          Go To Clients
        </Button>
      </div>

      <div ref={ref} className="fixed inset-0 z-[-1]"></div>
    </>
  );
}
