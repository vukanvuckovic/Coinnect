import { Loader2 } from "lucide-react";
import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const Loader = () => {
  const loading = useSelector((state: RootState) => state.loader.loading);
  const userLoading = useSelector((state: RootState) => state.user.loading);

  useGSAP(() => {
    if (!loading && !userLoading) {
      gsap.to(".loader-element", {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          gsap.set(".loader-element", {
            display: "none",
            opacity: 1,
          });
        },
      });
    } else {
      gsap.set(".loader-element", {
        display: "flex",
      });
    }
    gsap.to(".loader-icon", {
      rotate: 360,
      duration: 1,
      repeat: -1,
      ease: "none",
    });
  }, [loading, userLoading]);

  return (
    <div className="loader-element h-[100vh] w-full bg-white backdrop-blur-xl flex justify-center items-center gap-3 fixed top-0 left-0 z-50">
      <h3 className="text-theme-d !font-bold">Coinnect</h3>
      <Loader2
        size={24}
        color="var(--color-theme-d)"
        className="loader-icon"
      />
    </div>
  );
};

export default Loader;
