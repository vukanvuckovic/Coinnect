"use client";
import Card from "@/components/Card";
import CardOptions from "@/components/CardOptions";
import { Skeleton } from "@/components/ui/skeleton";
import { RootState } from "@/lib/store";
import { useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { capitalizeFirstLetter } from "../../../../utils/utils";
import { toast } from "sonner";
import NotFound from "@/components/NotFound";
import { GET_CARDS } from "@/lib/queries";
import { useRefetchOnAccountsChange } from "@/hooks/useRefetchTrigger";

const SkeletonCard = () => <Skeleton className="w-[320px] h-[190px]" />;

const Cards = () => {
  const user = useSelector((state: RootState) => state.user);

  const {
    data: cardsData,
    error: cardsError,
    loading: cardsLoading,
    refetch: refetchCards,
  } = useQuery(GET_CARDS, { variables: { userId: user?.userInfo?.id } });

  useEffect(() => {
    if (cardsError) {
      toast.error("Error getting cards", { description: cardsError.message });
    }
  }, [cardsError]);

  useRefetchOnAccountsChange(refetchCards);

  return (
    <div className="flex-1 flex flex-col gap-6 max-md:px-3 px-6 max-md:py-6 py-8 min-h-[80vh]">
      <div className="flex flex-col">
        <h2>My Bank Cards</h2>
        <span className="heading-desc">
          Effortlessly Manage Your Banking Assets
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <h4>My Cards</h4>
        <div className="flex-1 flex max-sm:flex-col flex-row gap-10 flex-wrap">
          {cardsLoading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : cardsData?.getCards?.length === 0 ? (
            <NotFound message="No cards found." />
          ) : (
            cardsData?.getCards?.map((item: Card) => (
              <CardOptions card={item} key={item.id}>
                <div className="flex flex-col gap-2 hover:scale-101 duration-100">
                  <Card card={item} />
                  <div className="flex items-center justify-between">
                    <span className="small-text">
                      {capitalizeFirstLetter(item.type)}
                    </span>
                    <span className="small-text">
                      {item.accounts?.length}{" "}
                      {item.accounts?.length > 1
                        ? "Accounts"
                        : item.accounts?.length === 1 && "Account"}
                    </span>
                  </div>
                </div>
              </CardOptions>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Cards;
