import { useParams } from 'react-router-dom';
import QuestionList from '../components/QuestionList';

export default function TopicPage() {
    const { topicId } = useParams();

    return (
        <div className="pt-24 px-6 max-w-7xl mx-auto">
            <QuestionList topicId={topicId} />
        </div>
    );
}
