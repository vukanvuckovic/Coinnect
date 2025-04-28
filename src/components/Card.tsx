import { Check, Pause } from "lucide-react";
import Image from "next/image";
import React from "react";

const Card = ({ card }: { card: Card }) => {
  return (
    <button
      data-test="card"
      className={`flex flex-col justify-between max-sm:w-full w-[320px] h-[190px] rounded-xl p-4 bg-gray-900 bg-[url('/lines.svg')] bg-cover border-[1px] border-white/30 text-white custom-shadow ${
        card.disabled && "opacity-80"
      }`}
    >
      <div className="flex items-start justify-between">
        <h3 className="max-md:!text-xl md:!text-2xl">Coinnect</h3>
        <div className="h-[30px] w-[50px] bg-white/20 rounded-sm relative">
          <Image
            src="/icons/mastercard.svg"
            alt="visa"
            fill
            className="object-contain"
          />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="flex flex-col items-start gap-2">
          <Image
            src="/icons/contactless.png"
            alt="contactless"
            height={24}
            width={24}
            className="object-contain"
          />
          <div className="flex items-center gap-6">
            <span className="max-md:text-sm font-semibold">
              {card?.user?.firstName} {card?.user?.lastName}
            </span>
            <span className="max-md:text-sm font-semibold">
              {String(new Date(Number(card?.expiry)).getMonth() + 1).padStart(
                2,
                "0"
              )}
              /{String(new Date(Number(card?.expiry)).getFullYear()).slice(2)}
            </span>
          </div>
          <span className="font-semibold max-md:text-sm md:text-lg tracking-widest">
            {card?.cardNumber}
          </span>
        </div>
        <div className="max-md:h-[30px] h-[36px] aspect-square rounded-full flex justify-center items-center bg-white/30 backdrop-blur-sm">
          {card.disabled ? (
            <Pause
              size={18}
              color="white"
            />
          ) : (
            <Check
              size={18}
              color="white"
            />
          )}
        </div>
      </div>
    </button>
  );
};

export default Card;
