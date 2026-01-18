import Sidebar from '../components/dsa/Sidebar';
import ContentArea from '../components/dsa/ContentArea';
import RightPanel from '../components/dsa/RightPanel';

export default function DSA() {
    return (
        <div className="flex justify-center min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto gap-8">
            <Sidebar />
            <ContentArea />
            <RightPanel />
        </div>
    );
}
