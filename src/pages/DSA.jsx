import Sidebar from '../components/dsa/Sidebar';
import ContentArea from '../components/dsa/ContentArea';
import RightPanel from '../components/dsa/RightPanel';

export default function DSA() {
    return (
        <div className="min-h-screen bg-[#0a0a0a]">
            <Sidebar />
            <div className="lg:ml-72 p-6 lg:p-8 flex gap-8 max-w-[1920px]">
                <ContentArea />
                <RightPanel />
            </div>
        </div>
    );
}
