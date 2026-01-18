import { questions } from "../data/questions";

export default function QuestionList({ topicId }) {
    const list = questions[topicId] || [];

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-semibold mb-6 capitalize">
                {topicId.replace("-", " ")}
            </h1>

            <div className="space-y-3">
                {list.map(q => (
                    <div
                        key={q.id}
                        className="flex justify-between items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer"
                    >
                        <div>
                            <h3 className="font-medium">{q.title}</h3>
                            <div className="flex gap-2 mt-1">
                                {q.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-white/10 px-2 py-0.5 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-green-400 text-sm">{q.difficulty}</span>
                            {q.solved && <span className="text-green-500">✔</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
