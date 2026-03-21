import { useState, useEffect } from "react";
import { getStudentDiary } from "./assets/Api";
import { Eye, X } from 'lucide-react';

function DiaryTable({ type, title }) {
    const [diary, setDiary] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEntry, setSelectedEntry] = useState(null);

    useEffect(() => {
        fetchDiary(page);
    }, [page]);

    const fetchDiary = (pageNum) => {
        getStudentDiary(`${type}-diaries?page=${pageNum}`)
            .then((response) => {
                const response_data = response.data;

                setDiary(response_data.data);
                setTotalPages(response_data.last_page);
            })
            .catch((err) => {
                console.error(`Error Fetching ${type} Diary`, err);
            });
    };

    return (
        <section className={`${type}-diary`}>
            <h1>
                {title}: {type === "project"
                    ? diary[0]?.project?.title
                    : diary[0]?.internship?.name}
            </h1>

            {!diary.length ? (
                <h3>Loading...</h3>
            ) : (
                <>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {diary.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{entry.date}</td>
                                    <td className="description">{entry.description}</td>
                                    <td>
                                        <button className="view-button" onClick={() => setSelectedEntry(entry)}>
                                            <Eye />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
                            Prev
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
                            Next
                        </button>
                    </div>

                </>
            )}

            {selectedEntry && (
                <div className="modal-overlay" onClick={() => setSelectedEntry(null)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="header">
                            <h1>Diary Details</h1>
                            <button className="close-btn" onClick={() => setSelectedEntry(null)}>
                                <X />
                            </button>
                        </div>

                        <table className="details-table">
                            <tbody>
                                <tr>
                                    <td><b>Date</b></td>
                                    <td>{selectedEntry.date}</td>
                                </tr>

                                <tr>
                                    <td><b>Description</b></td>
                                    <td>{selectedEntry.description}</td>
                                </tr>

                                <tr>
                                    <td><b>Hours</b></td>
                                    <td>{selectedEntry.hours}</td>
                                </tr>

                                <tr>
                                    <td><b>Blockers</b></td>
                                    <td>{selectedEntry.blockers || "None"}</td>
                                </tr>

                                <tr>
                                    <td><b>Learnings</b></td>
                                    <td>{selectedEntry.learnings}</td>
                                </tr>

                                {selectedEntry.links && (
                                    <tr>
                                        <td><b>Links</b></td>
                                        <td>
                                            {selectedEntry.links.split(",").map((link, i) => (
                                                <div key={i}>
                                                    <a href={link.trim()} target="_blank">
                                                        {link.trim()}
                                                    </a>
                                                </div>
                                            ))}

                                        </td>
                                    </tr>
                                )}

                            </tbody>
                        </table>

                    </div>
                </div>
            )}
        </section>
    );
}

export default DiaryTable;