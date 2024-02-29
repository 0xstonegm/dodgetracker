import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About",
    description: "About Dodgetracker",
};

export default function About() {
    return (
        <div className="flex h-[90vh] items-center justify-center">
            <div className="flex h-[60%] w-[50%] flex-col items-center justify-between">
                <p>
                    Dodgetracker started tracking dodges at 10 AM on the 28th of
                    February 2024 UTC.
                </p>
                <p className="text-xs">
                    Dodgetracker isn&apos;t endorsed by Riot Games and
                    doesn&apos;t reflect the views or opinions of Riot Games or
                    anyone officially involved in producing or managing Riot
                    Games properties. Riot Games, and all associated properties
                    are trademarks or registered trademarks of Riot Games, Inc.
                </p>
            </div>
        </div>
    );
}
