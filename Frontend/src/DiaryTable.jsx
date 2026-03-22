import { useState, useEffect } from "react";
import { getSkills, getStudentDiary, getDiaryByID, createDiary } from "./assets/Api";
import { Eye, X, SquarePen, Pen } from 'lucide-react';

function DiaryTable({ type, title, metaId, metaTitle }) {
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedEntryId, setSelectedEntryId] = useState(null);
    const [selectedDiaryData, setSelectedDiaryData] = useState(null);
    const [diary, setDiary] = useState([]);
    const [skills, setSkills] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [skillInput, setSkillInput] = useState("");
    const [filteredSkills, setFilteredSkills] = useState([]);
    const [formData, setFormData] = useState({
        date: "",
        description: "",
        hours: "",
        learnings: "",
        blockers: "",
        skills: [],
        links: ""
    });
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "success"
    });

    useEffect(() => {
        getSkills()
            .then(response => {
                const response_data = response.data;
                setSkills(response_data);
            })
            .catch(err => console.error("Error fetching skills", err));
    }, []);

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

    useEffect(() => {
        if (selectedEntryId) {
            fetchDiaryData(selectedEntryId);
        }
    }, [selectedEntryId]);

    const fetchDiaryData = (id) => {
        getDiaryByID(id, `${type}-diaries`)
            .then((response) => {
                const response_data = response.data;

                setSelectedDiaryData(response_data);
            })
            .catch((err) => {
                console.error(`Error Fetching ${type} Diary`, err);
            });
    }

    useEffect(() => {
        if (skillInput.trim() === "") {
            setFilteredSkills([]);
        } else {
            setFilteredSkills(
                skills.filter(skill =>
                    skill.name.toLowerCase().includes(skillInput.toLowerCase())
                )
            );
        }
    }, [skillInput, skills]);

    const skillMap = Object.fromEntries(
        skills.map(skill => [skill.id, skill.name])
    );

    const addSkill = (skill) => {
        if (formData.skills.length >= 10) return;

        if (!formData.skills.includes(skill.id)) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skill.id]
            }));
        }
        setSkillInput("");
        setFilteredSkills([]);
    };

    const removeSkill = (id) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== id)
        }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreate = async () => {
        try {
            const payload = {
                ...formData,
                hours: Number(formData.hours),
                skill_ids: formData.skills.map(id => String(id)),
                [`${type}_id`]: metaId,
                mood_slider: 5
            };

            delete payload.skills;

            const res = await createDiary(type, payload);

            // ✅ Show popup
            setPopup({
                show: true,
                message: res.message,
                type: "success"
            });

            setIsEditMode(false);
            setShowCreateModal(false);

            setFormData({
                date: "",
                description: "",
                hours: "",
                learnings: "",
                blockers: "",
                skills: [],
                links: ""
            });

            fetchDiary(page);

            setTimeout(() => {
                setPopup(prev => ({ ...prev, show: false }));
            }, 3000);

        } catch (err) {
            setPopup({
                show: true,
                message: "Something went wrong",
                type: "error"
            });
        }
    };

    const handleEdit = async (id) => {
        try {
            const res = await getDiaryByID(id, `${type}-diaries`);
            const data = res.data;

            setFormData({
                id: data.id,
                date: data.date,
                description: data.description,
                hours: data.hours,
                learnings: data.learnings,
                blockers: data.blockers,
                links: data.links || "",
                skills: data.skills?.map(id => Number(id.diary_skill_id)) || []
            });

            setIsEditMode(true);
            setShowCreateModal(true);
        } catch (err) {
            console.error("Edit load failed", err);
        }
    };

    const isValid =
        formData.date &&
        formData.description &&
        formData.hours &&
        formData.learnings &&
        formData.skills.length > 0;

    return (
        <section className={`${type}-diary diary-table`}>
            <div className="header">
                <h1>
                    {title}: {metaTitle}
                </h1>
                <button className="add-button" onClick={() => setShowCreateModal(true)} title="Add">
                    <SquarePen />
                </button>
            </div>

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
                                        <button className="view-button" onClick={() => setSelectedEntryId(entry.id)}>
                                            <Eye />
                                        </button>
                                        <button onClick={() => handleEdit(entry.id)}>
                                            <Pen />
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

            {selectedDiaryData && (
                <div className="modal-overlay" onClick={() => {
                    setSelectedEntryId(null);
                    setSelectedDiaryData(null)
                }}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="header">
                            <h1>{title} Details</h1>
                            <button className="close-btn" onClick={() => {
                                setSelectedEntryId(null);
                                setSelectedDiaryData(null)
                            }}>
                                <X />
                            </button>
                        </div>

                        <table className="details-table">
                            <tbody>
                                <tr>
                                    <td><b>Date</b></td>
                                    <td>
                                        {new Date(selectedDiaryData.date)
                                            .toLocaleDateString("en-GB")}
                                    </td>
                                </tr>

                                <tr>
                                    <td><b>Description</b></td>
                                    <td>{selectedDiaryData.description}</td>
                                </tr>

                                <tr>
                                    <td><b>Hours</b></td>
                                    <td>{selectedDiaryData.hours}</td>
                                </tr>


                                <tr>
                                    <td><b>Learnings</b></td>
                                    <td>{selectedDiaryData.learnings}</td>
                                </tr>

                                <tr>
                                    <td><b>Blockers</b></td>
                                    <td>{selectedDiaryData.blockers || "None"}</td>
                                </tr>

                                <tr>
                                    <td><b>Skills</b></td>
                                    <td className="skills">
                                        {selectedDiaryData.skills?.map((skill, i) => (
                                            <span key={i}>
                                                {skillMap[skill.diary_skill_id] || "--"}
                                            </span>
                                        ))}
                                    </td>
                                </tr>

                                {selectedDiaryData.links && (
                                    <tr>
                                        <td><b>Links</b></td>
                                        <td>
                                            {selectedDiaryData.links.split(",").map((link, i) => (
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

            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>

                        <div className="header">
                            <h1>{isEditMode ? "Edit" : "Create"} {title}</h1>
                            <button onClick={() => setShowCreateModal(false)}>
                                <X />
                            </button>
                        </div>

                        <div className="form">
                            <div className="date">
                                <label>Date <span>*</span></label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date || ""}
                                    onChange={handleChange}
                                    disabled={isEditMode}
                                />
                            </div>

                            <div className="desc">
                                <label>What I worked on <span>*</span></label>
                                <textarea
                                    name="description"
                                    placeholder="Describe your work..."
                                    value={formData.description || ""}
                                    maxLength={2000}
                                    onChange={handleChange}
                                />
                                <small>{formData.description.length}/2000</small>
                            </div>

                            <div className="hour">
                                <label>Hours worked <span>*</span></label>
                                <input
                                    type="number"
                                    name="hours"
                                    placeholder="e.g. 8"
                                    value={formData.hours || ""}
                                    min="0"
                                    max="24"
                                    step="0.25"
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="links">
                                <label>Show Your Work</label>
                                <textarea
                                    name="links"
                                    placeholder="Paste links separated by commas"
                                    maxLength={5000}
                                    value={formData.links || ""}
                                    onChange={handleChange}
                                />
                                <small>{formData.links.length}/5000</small>
                            </div>

                            <div className="learn">
                                <label>Learnings / Outcomes <span>*</span></label>
                                <textarea
                                    name="learnings"
                                    placeholder="What did you learn?"
                                    value={formData.learnings || ""}
                                    maxLength={2000}
                                    onChange={handleChange}
                                />
                                <small>{formData.learnings.length}/2000</small>
                            </div>

                            <div className="blocker">
                                <label>Blockers / Risks</label>
                                <textarea
                                    name="blockers"
                                    placeholder="Any blockers faced?"
                                    value={formData.blockers || ""}
                                    maxLength={1000}
                                    onChange={handleChange}
                                />
                                <small>{formData.blockers.length}/1000</small>
                            </div>

                            <div className="skills">
                                <label>Skills Used <span>*</span></label>
                                <div className="skills-input">

                                    <div className="input-container">

                                        {formData.skills.map(id => (
                                            <span key={id} className="chip">
                                                {skillMap[id]}
                                                <button onClick={() => removeSkill(id)}>×</button>
                                            </span>
                                        ))}

                                        <input
                                            type="text"
                                            placeholder={formData.skills.length === 0 ? "Search skills..." : ""}
                                            value={skillInput}
                                            onChange={(e) => setSkillInput(e.target.value)}
                                            disabled={formData.skills.length >= 10}
                                        />

                                    </div>

                                    {/* Dropdown */}
                                    {filteredSkills.length > 0 && formData.skills.length < 10 && (
                                        <div className="dropdown">
                                            {filteredSkills
                                                .filter(skill => !formData.skills.includes(skill.id))
                                                .map(skill => (
                                                    <div
                                                        key={skill.id}
                                                        className="dropdown-item"
                                                        onClick={() => addSkill(skill)}
                                                    >
                                                        {skill.name}
                                                    </div>
                                                ))}
                                        </div>
                                    )}

                                </div>
                            </div>

                            <div className="submit">
                                <button disabled={!isValid} onClick={handleCreate}>
                                    Submit
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}
            {popup.show && (
                <div className={`popup ${popup.type}`}>
                    {popup.message}
                </div>
            )}
        </section>
    );
}

export default DiaryTable;