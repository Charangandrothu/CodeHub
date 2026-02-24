import Sidebar from '../components/dsa/Sidebar';
import ContentArea from '../components/dsa/ContentArea';
import RightPanel from '../components/dsa/RightPanel';

export default function DSA() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Sidebar />
            <div className="dsa-layout lg:ml-72 p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8 max-w-[1920px]">
                <ContentArea />
                <RightPanel />
            </div>
        </div>
    );
}
