import { FC } from "react";

const Home: FC = () => {
    return (
        <div className="h-screen flex flex-column">
            <div className="flex items-center bg-slate-900">
                <input type="color" />
            </div>
            <div>Container</div>
        </div>
    );
};

export default Home;
