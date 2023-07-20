import Canvas from "@/components/Canvas";
import { FC } from "react";

const Home: FC = () => {
    return (
        <div className="h-screen w-full flex flex-column">
            <div className="flex items-center bg-slate-900">
                <input type="color" />
            </div>
            <div className="w-full flex items-center justify-center">
                <Canvas width={700} height={500} />
            </div>
        </div>
    );
};

export default Home;
