import DodgeList from "../components/DodgeList";

export default function Home() {
    return (
        <>
            <header className="p-4 text-center text-4xl font-bold">
                Dodges
            </header>
            <div className="mx-auto w-3/4">
                <DodgeList></DodgeList>
            </div>
        </>
    );
}
