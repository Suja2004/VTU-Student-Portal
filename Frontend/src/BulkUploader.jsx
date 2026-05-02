import { useState, useEffect } from "react";
import { X, FileBraces, Braces } from "lucide-react";

function BulkUploader({ type, title, metaId, createDiary, skills = [], onComplete, isOpen, onClose }) {
    const [mode, setMode] = useState("input");
    const [copied, setCopied] = useState(false);
    const [showExample, setShowExample] = useState(false);
    const [showSkills, setShowSkills] = useState(false);
    const [jsonInput, setJsonInput] = useState("");
    const [skillSearch, setSkillSearch] = useState("");
    const [uploadQueue, setUploadQueue] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({
        total: 0,
        success: 0,
        failed: 0,
        inProgress: false
    });
    const [popup, setPopup] = useState({
        show: false,
        message: "",
        type: "error"
    });

    useEffect(() => {
        if (!isOpen) {
            setJsonInput("");
            setUploadQueue([]);
            setUploadProgress({
                total: 0,
                success: 0,
                failed: 0,
                inProgress: false
            });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isValidEntry = (e) =>
        e.date &&
        e.description &&
        e.hours &&
        e.learnings &&
        Array.isArray(e.skills) &&
        e.skills.length > 0;

    const prepareQueue = (entries) => {
        const prepared = entries.map((entry, index) => ({
            id: index,
            data: entry,
            status: "pending",
            error: null
        }));

        setUploadQueue(prepared);
        setUploadProgress({
            total: prepared.length,
            success: 0,
            failed: 0,
            inProgress: false
        });
    };

    const processFile = async (file) => {
        try {
            const text = await file.text();
            const entries = JSON.parse(text);
            if (!Array.isArray(entries)) throw new Error();

            prepareQueue(entries);
        } catch {
            setPopup({
                show: true,
                message: "Invalid JSON file",
                type: "error"
            });

            setTimeout(() => {
                setPopup(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
    };

    const handleJsonSubmit = () => {
        try {
            const entries = JSON.parse(jsonInput);
            if (!Array.isArray(entries)) throw new Error();

            prepareQueue(entries);
        } catch {
            setPopup({
                show: true,
                message: "Invalid JSON file",
                type: "error"
            });

            setTimeout(() => {
                setPopup(prev => ({ ...prev, show: false }));
            }, 3000);
        }
    };

    const uploadAll = async () => {
        setUploadProgress(p => ({ ...p, inProgress: true }));

        let success = 0;
        let failed = 0;
        const updated = [...uploadQueue];

        for (let item of updated) {
            if (item.status === "success") continue;

            try {
                if (!isValidEntry(item.data)) throw new Error("Validation failed");

                const payload = {
                    ...item.data,
                    hours: Number(item.data.hours),
                    skill_ids: item.data.skills.map(id => String(id)),
                    [`${type}_id`]: metaId,
                    mood_slider: 5
                };

                delete payload.skills;

                await createDiary(type, payload);

                item.status = "success";
                success++;

            } catch (err) {
                item.status = "failed";
                item.error = err.message;
                failed++;
            }

            setUploadQueue([...updated]);
            setUploadProgress({
                total: updated.length,
                success,
                failed,
                inProgress: true
            });
        }

        setUploadProgress(p => ({ ...p, inProgress: false }));
        onComplete && onComplete();
    };

    const retryFailed = async () => {
        const updated = [...uploadQueue];

        for (let item of updated) {
            if (item.status !== "failed") continue;

            try {
                const payload = {
                    ...item.data,
                    hours: Number(item.data.hours),
                    skill_ids: item.data.skills.map(id => String(id)),
                    [`${type}_id`]: metaId,
                    mood_slider: 5
                };

                delete payload.skills;

                await createDiary(type, payload);

                item.status = "success";
                item.error = null;

            } catch (err) {
                item.error = err.message;
            }

            setUploadQueue([...updated]);
        }
    };

    const handleCopyAllSkills = async () => {
        const text = skills
            .map(s => `${s.id} - ${s.name}`)
            .join("\n");

        await navigator.clipboard.writeText(text);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadExample = () => {
        const example = [
            {
                date: "2026-04-24",
                description: "Worked on API integration",
                hours: 6,
                learnings: "Learned retry logic",
                blockers: "Timeout issues",
                skills: [1, 2],
                links: "https://example.com"
            },
            {
                date: "2026-04-25",
                description: "Built bulk upload feature",
                hours: 5,
                learnings: "Understood queue processing",
                blockers: "",
                skills: [2, 3],
                links: ""
            }
        ];

        const blob = new Blob(
            [JSON.stringify(example, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "diary-bulk-example.json";
        a.click();

        URL.revokeObjectURL(url);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal bulk-modal" onClick={(e) => e.stopPropagation()}>

                <div className="header">
                    <h2>{title} Bulk Upload</h2>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className="mode-switch">
                    <button className={`add-button ${mode == "input" ? "active" : " "}`} onClick={() => setMode("input")}>
                        <Braces />
                    </button>
                    <button className={`add-button ${mode == "file" ? "active" : " "}`} onClick={() => setMode("file")}>
                        <FileBraces />
                    </button>
                </div>

                {mode === "file" && (
                    <div
                        className="drop-zone"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                    >
                        <p>Drag & Drop JSON file</p>

                        <input
                            type="file"
                            accept="application/json"
                            onChange={(e) => processFile(e.target.files[0])}
                        />
                        <button className="download-btn" onClick={downloadExample}>
                            Download Example JSON
                        </button>
                    </div>
                )}

                {mode === "input" && (
                    <div className="json-input">
                        <textarea
                            placeholder="Paste JSON array here..."
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                        />
                        <button className="load-btn" onClick={handleJsonSubmit}>
                            Load JSON
                        </button>
                        <div className="example-section">
                            <div
                                className="example-header"
                                onClick={() => setShowExample(prev => !prev)}
                            >
                                <p className="example-title">Example JSON input</p>
                                <span className="toggle-icon">
                                    {showExample ? "▲" : "▼"}
                                </span>
                            </div>

                            {showExample && (
                                <pre className="example-box">
                                    {`[
  {
    "date": "2026-04-20",
    "description": "Designed UI components",
    "hours": 4,
    "learnings": "Improved React state handling",
    "blockers": "",
    "skills": [1, 4],
    "links": ""
  }
]`}
                                </pre>
                            )}
                        </div>

                    </div>
                )}

                <div className="skills">

                    <div
                        className="skills-header"
                        onClick={() => setShowSkills(prev => !prev)}
                    >
                        <h3>Available Skills</h3>
                        <span className="toggle-icon">
                            {showSkills ? "▲" : "▼"}
                        </span>
                    </div>

                    {showSkills && (
                        <>
                            <input
                                placeholder="Search skills..."
                                value={skillSearch}
                                onChange={(e) => setSkillSearch(e.target.value)}
                            />

                            <button className="copy-btn" onClick={handleCopyAllSkills}>
                                {copied ? "Copied!" : "Copy All"}
                            </button>

                            <div className="skills-reference">
                                <div className="skills-list">
                                    {skills
                                        .filter(s =>
                                            s.name.toLowerCase().includes(skillSearch.toLowerCase())
                                        )
                                        .map(skill => (
                                            <div
                                                key={skill.id}
                                                className="skill-item"
                                                onClick={() => navigator.clipboard.writeText(skill.id)}
                                            >
                                                <span>{skill.name}</span>
                                                <span>{skill.id}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </>
                    )}

                </div>

                {uploadProgress.total > 0 && (
                    <div className="progress-container">
                        <div
                            className="progress-bar"
                            style={{
                                width: `${(uploadProgress.success / uploadProgress.total) * 100}%`
                            }}
                        />

                        <p>
                            {uploadProgress.success}/{uploadProgress.total} |
                            Failed: {uploadProgress.failed}
                        </p>

                        <button onClick={uploadAll} disabled={uploadProgress.inProgress}>
                            Start Upload
                        </button>

                        <button onClick={retryFailed} disabled={uploadProgress.inProgress}>
                            Retry Failed
                        </button>
                    </div>
                )}

                <div className="upload-list">
                    {uploadQueue.map(item => (
                        <div key={item.id} className={`row ${item.status}`}>
                            <span>{item.data.date}</span>
                            <span>{item.status}</span>
                            {item.error && <small>{item.error}</small>}
                        </div>
                    ))}
                </div>

            </div>
            {popup.show && (
                <div className={`popup ${popup.type}`}>
                    {popup.message}
                </div>
            )}
        </div>
    );
}

export default BulkUploader;