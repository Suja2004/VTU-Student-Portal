import { useState, useEffect } from "react";
import { getStudentDetails, getStudentProjectDetails, getStudentInternshipDetails, handleLogout } from "./assets/Api";
import DiaryTable from "./DiaryTable";
import { PanelRightOpen, PanelRightClose } from 'lucide-react';


function Home() {
    const [studentDetails, setStudentDetails] = useState(null);
    const [projectDetails, setProjectDetails] = useState(null);
    const [internshipDetails, setInternshipDetails] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        getStudentDetails()
            .then((response) => {
                setStudentDetails(response.data);
            })
            .catch((err) => {
                console.error("Error Fetching Student Details", err);
            });

        getStudentProjectDetails()
            .then((response) => {
                setProjectDetails(response.data);
            })
            .catch((err) => {
                console.error("Error Fetching Project Details", err);
            });

        getStudentInternshipDetails()
            .then((response) => {
                setInternshipDetails(response.data.data);
            })
            .catch((err) => {
                console.error("Error Fetching Project Details", err);
            });
    }, []);

    return (
        <div className="app-container">

            {/* Sidebar */}
            <div className={`sidebar-panel ${sidebarOpen ? "open" : "closed"}`}>

                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <h2>Dashboard</h2>
                        <button onClick={() => setSidebarOpen(false)}>
                            <PanelRightOpen />
                        </button>
                    </div>

                    <nav>
                        <a href="#student">Student</a>
                        <a href="#project">Project</a>
                        <a href="#internship">Internship</a>
                        <a href="#project-diary">Project Diary</a>
                        <a href="#internship-diary">Internship Diary</a>
                        <a
                            href="/"
                            onClick={(e) => {
                                e.preventDefault();
                                handleLogout();
                            }}
                        >
                            Log Out
                        </a>
                    </nav>
                </aside>

                {!sidebarOpen && <div className="panel-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <PanelRightClose />
                </div>}

            </div>

            {/* Main Content */}
            <main className={`content ${sidebarOpen ? "shrink" : "expand"}`}>
                <h1>VTU Student Activity Portal</h1>
                <section id="student" className="card">
                    {!studentDetails ? (
                        <h2>Loading student...</h2>
                    ) : (
                        <>
                            <h1>Student Details</h1>
                            <p><b>Name:</b> {studentDetails.user.name}</p>
                            <p><b>Email:</b> {studentDetails.user.email}</p>
                            <p><b>Phone:</b> {studentDetails.user.mobile}</p>
                            <p><b>USN:</b> {studentDetails.usn}</p>
                            <p><b>Semester:</b> {studentDetails.semester}</p>
                            <p><b>College:</b> {studentDetails.college.name}</p>
                        </>
                    )}
                </section>

                <section id="project" className="card">
                    {!projectDetails ? (
                        <h2>Loading project details...</h2>
                    ) : (
                        <>
                            <h1>Project Details</h1>
                            <p><b>Title:</b> {projectDetails.title}</p>
                            <p><b>Description:</b> {projectDetails.description}</p>
                            <p><b>Guide:</b> {projectDetails.guide_name}</p>

                            <h2>Team</h2>
                            {projectDetails?.project_member_details?.map((member, i) => (
                                <div key={i} className="member">
                                    <p>{member.name}</p>
                                    <p>{member.email}</p>
                                    <p>{member.usn}</p>
                                </div>
                            ))}
                        </>
                    )}
                </section>

                <section id="internship" className="card">
                    {!internshipDetails ? (
                        <h2>Loading internship details...</h2>
                    ) : (
                        <>
                            {internshipDetails.map((item, i) => (
                                <div key={i}>
                                    <h1>Internship Details</h1>
                                    <p><b>Name:</b> {item.internship_details?.name}</p>
                                    <p><b>Company:</b> {item.internship_details?.company}</p>
                                    <p><b>Type:</b> {item.internship_details?.internship_type}</p>
                                </div>
                            ))}
                        </>
                    )}
                </section>
                {projectDetails && <section id="project-diary" className="card">
                    <DiaryTable type="project" title="Project Diary" metaId={projectDetails?.id} metaTitle={projectDetails?.title} />
                </section>}

                {internshipDetails && <section id="internship-diary" className="card">
                    <DiaryTable type="internship" title="Internship Diary" metaId={internshipDetails?.[0]?.internship_id}
                        metaTitle={internshipDetails?.[0]?.internship_details?.name} />
                </section>}

            </main>
        </div>
    );
}

export default Home;