import { useEffect } from "react";
import styles from "./fetchLoading.module.css";

const FetchLoadingScreen = () => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  });

  return (
    <>
      <div className={styles.loading}>
        <div className={styles.c}>
          <svg
            className={styles.pl}
            viewBox="0 0 200 200"
            width="200"
            height="200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="pl-grad1" x1="1" y1="0.5" x2="0" y2="0.5">
                <stop offset="0%" stopColor="#6c9bcf" />
                <stop offset="100%" stopColor="#6c9bcf" />
              </linearGradient>
              <linearGradient id="pl-grad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c9bcf" />
                <stop offset="100%" stopColor="#6c9bcf" />
              </linearGradient>
            </defs>
            <circle
              className={styles.pl__ring}
              cx="100"
              cy="100"
              r="82"
              fill="none"
              stroke="url(#pl-grad1)"
              strokeWidth="36"
              strokeDasharray="0 257 1 257"
              strokeDashoffset="0.01"
              strokeLinecap="round"
              transform="rotate(-90,100,100)"
            />
            <line
              className={styles.pl__ball}
              stroke="url(#pl-grad2)"
              x1="100"
              y1="18"
              x2="100.01"
              y2="182"
              strokeWidth="36"
              strokeDasharray="1 165"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default FetchLoadingScreen;
