import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Box,
  CalendarDays,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  ClipboardList,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FilePlus2,
  Folder,
  FolderPlus,
  Home,
  Library,
  LockKeyhole,
  LogOut,
  PanelLeft,
  Pencil,
  Presentation,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";
import { isFirebaseConfigured } from "./lib/firebase";
import {
  createLibraryFolder,
  deleteLibraryFile,
  deleteLibraryFolder,
  getLibraryFileUrl,
  loadLibraryResources,
  renameLibraryFolder,
  uploadLibraryFile,
} from "./lib/libraryStore";

const APP_CREDENTIALS = {
  username: "lekhabhms26",
  password: "lekha2662",
};

const DEFAULT_ACCOUNT = {
  username: APP_CREDENTIALS.username,
  password: APP_CREDENTIALS.password,
  profileImage: "",
};

const MATERIALS_WORKSPACE_ID = "materials";
const NOTES_WORKSPACE_ID = "sanjanaka-notes";
const NOTES_WORKSPACE_TITLE = "sanjana'ka-notes";

function isStandaloneWorkspaceId(id) {
  return id === MATERIALS_WORKSPACE_ID || id === NOTES_WORKSPACE_ID;
}

const examTimetable = [
  { day: "Monday", date: "20-07-2026", time: "9.30 am to 12.30 pm", paper: "I", subject: "Homoeopathic Materia Medica", code: "581641" },
  { day: "Tuesday", date: "21-07-2026", time: "9.30 am to 12.30 pm", paper: "II", subject: "Organon of Medicine and Homoeopathic Philosophy - I", code: "581642" },
  { day: "Thursday", date: "23-07-2026", time: "9.30 am to 12.30 pm", paper: "III", subject: "Organon of Medicine and Homoeopathic Philosophy - II", code: "581643" },
  { day: "Friday", date: "24-07-2026", time: "9.30 am to 12.30 pm", paper: "IV", subject: "Homoeopathic Repertory and case taking", code: "581644" },
  { day: "Monday", date: "27-07-2026", time: "9.30 am to 12.30 pm", paper: "V", subject: "Surgery I", code: "581645" },
  { day: "Tuesday", date: "28-07-2026", time: "9.30 am to 12.30 pm", paper: "VI", subject: "Surgery II", code: "581646" },
  { day: "Thursday", date: "30-07-2026", time: "9.30 am to 12.30 pm", paper: "VII", subject: "Gynecology and Obstetrics I", code: "581647" },
  { day: "Friday", date: "31-07-2026", time: "9.30 am to 12.30 pm", paper: "VIII", subject: "Gynecology and Obstetrics II", code: "581648" },
  { day: "Monday", date: "03-07-2026", time: "9.30 am to 12.30 pm", paper: "IX", subject: "Community Medicine", code: "581649", note: "Printed date in PDF" },
  { day: "Tuesday", date: "04-08-2026", time: "9.30 am to 11.00 am", paper: "X", subject: "Essentials of Pharmacology", code: "581650" },
];

const surgeryFolders = [
  { id: "s1-ppts", name: "PPTs", parentId: null },
];

const surgeryFiles = [
  {
    id: "s1-short-2008-2022",
    title: "(2008-2022) question bank short questions",
    description: "Write Notes and Short Answers arranged by repeated question frequency.",
    period: "2008-2022",
    type: "PPTX",
    folderId: "s1-ppts",
    fileName: "(2008-2022) question bank short questions.pptx",
  },
  {
    id: "s1-imp-2008-2022",
    title: "surgery-1(2008-2022)-IMP-questions",
    description: "Important Surgery-1 essay question deck for the older question-bank range.",
    period: "2008-2022",
    type: "PPTX",
    folderId: "s1-ppts",
    fileName: "surgery-1(2008-2022)-IMP-questions.pptx",
  },
  {
    id: "s1-notes-2018-2025",
    title: "write-notes-short-questions detailed frequency",
    description: "Detailed frequency PPT for Write Notes and Short Questions from the newer bank.",
    period: "2018-2025",
    type: "PPTX",
    folderId: "s1-ppts",
    fileName: "surgery-1-write-notes-short-questions-detailed-frequency(2018-2025).pptx",
  },
  {
    id: "s1-essay-2018-2025",
    title: "Surgey-1 Important Questions",
    description: "Essay questions grouped by topic frequency for quick revision planning.",
    period: "2018-2025",
    type: "PPTX",
    folderId: "s1-ppts",
    fileName: "Surgey-1_Important_Questions_2018-2025.pptx",
  },
];

const baseSubjects = [
  {
    id: "surgery-1",
    title: "Surgery-1",
    description: "Compiled IMP questions, short questions, and frequency decks.",
    files: surgeryFiles,
    folders: surgeryFolders,
  },
  { id: "surgery-2", title: "Surgery-2", description: "Workspace prepared for future Surgery-2 resources.", files: [], folders: [] },
  { id: "organon-1", title: "Organon-1", description: "Workspace prepared for Organon-1 resources.", files: [], folders: [] },
  { id: "organon-2", title: "Organon-2", description: "Workspace prepared for Organon-2 resources.", files: [], folders: [] },
  { id: "mm", title: "MM", description: "Workspace prepared for Materia Medica resources.", files: [], folders: [] },
  { id: "gyn-obs-1", title: "Gynecology and Obstetrics-1", description: "Workspace prepared for first paper resources.", files: [], folders: [] },
  { id: "gyn-obs-2", title: "Gynecology and Obstetrics-2", description: "Workspace prepared for second paper resources.", files: [], folders: [] },
  { id: "community-medicine", title: "Community Medicine", description: "Workspace prepared for Community Medicine resources.", files: [], folders: [] },
  { id: "repertory", title: "Repertory", description: "Workspace prepared for Repertory resources.", files: [], folders: [] },
];

function resourceUrl(fileName) {
  return `/resources/surgery-1/${encodeURIComponent(fileName)}`;
}

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredAccount() {
  try {
    const stored = JSON.parse(localStorage.getItem("lekha.account") || "null");
    return { ...DEFAULT_ACCOUNT, ...(stored || {}) };
  } catch {
    return DEFAULT_ACCOUNT;
  }
}

function groupItemsBySubject(items) {
  return items.reduce((grouped, item) => {
    const subjectId = item.subjectId;
    if (!subjectId) return grouped;
    return {
      ...grouped,
      [subjectId]: [...(grouped[subjectId] || []), item],
    };
  }, {});
}

function addItemsToSubject(existing, subjectId, items) {
  return {
    ...existing,
    [subjectId]: [...(existing[subjectId] || []), ...items],
  };
}

function getLocalFileRecord(subjectId, folderId, file) {
  return {
    id: makeId(`${subjectId}-file`),
    title: file.name.replace(/\.[^.]+$/, ""),
    description: "Added in this browser session. Firebase save failed or is not configured.",
    period: "New",
    type: file.name.split(".").pop()?.toUpperCase() || "FILE",
    folderId,
    localUrl: URL.createObjectURL(file),
    fileName: file.name,
  };
}

export default function App() {
  const [account, setAccount] = useState(readStoredAccount);
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("lekha.session") || "null");
    } catch {
      return null;
    }
  });
  const [activeView, setActiveView] = useState("dashboard");
  const [activeSubjectId, setActiveSubjectId] = useState(null);
  const [query, setQuery] = useState("");
  const [customFolders, setCustomFolders] = useState({});
  const [customFiles, setCustomFiles] = useState({});
  const [folderRenames, setFolderRenames] = useState({});
  const [deletedFolderIds, setDeletedFolderIds] = useState([]);
  const [deletedFileIds, setDeletedFileIds] = useState([]);
  const [currentFolderBySubject, setCurrentFolderBySubject] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [firebaseError, setFirebaseError] = useState("");

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    let isMounted = true;
    loadLibraryResources()
      .then(({ folders, files }) => {
        if (!isMounted) return;
        setCustomFolders(groupItemsBySubject(folders));
        setCustomFiles(groupItemsBySubject(files));
        setFirebaseError("");
      })
      .catch((error) => {
        if (!isMounted) return;
        setFirebaseError(error.message || "Firebase data could not be loaded.");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const subjects = useMemo(
    () =>
      baseSubjects.map((subject) => {
        const visibleBaseFolders = subject.folders.filter((folder) => !deletedFolderIds.includes(folder.id));
        const visibleCustomFolders = (customFolders[subject.id] || []).filter((folder) => !deletedFolderIds.includes(folder.id));
        const visibleBaseFiles = subject.files.filter(
          (file) => !deletedFileIds.includes(file.id) && !deletedFolderIds.includes(file.folderId),
        );
        const visibleCustomFiles = (customFiles[subject.id] || []).filter(
          (file) => !deletedFileIds.includes(file.id) && !deletedFolderIds.includes(file.folderId),
        );
        const renamedBaseFolders = visibleBaseFolders.map((folder) => ({
          ...folder,
          name: folderRenames[folder.id] || folder.name,
        }));
        const renamedCustomFolders = visibleCustomFolders.map((folder) => ({
          ...folder,
          name: folderRenames[folder.id] || folder.name,
        }));
        return {
          ...subject,
          folders: [...renamedBaseFolders, ...renamedCustomFolders],
          files: [...visibleBaseFiles, ...visibleCustomFiles],
        };
      }),
    [customFiles, customFolders, deletedFileIds, deletedFolderIds, folderRenames],
  );

  const activeSubject = activeSubjectId ? subjects.find((subject) => subject.id === activeSubjectId) : null;
  const materialsSubject = useMemo(() => {
    const folders = (customFolders[MATERIALS_WORKSPACE_ID] || [])
      .filter((folder) => !deletedFolderIds.includes(folder.id))
      .map((folder) => ({
        ...folder,
        name: folderRenames[folder.id] || folder.name,
      }));
    const files = (customFiles[MATERIALS_WORKSPACE_ID] || []).filter(
      (file) => !deletedFileIds.includes(file.id) && !deletedFolderIds.includes(file.folderId),
    );

    return {
      id: MATERIALS_WORKSPACE_ID,
      title: "Materials",
      description: "Save random study materials, notes, PDFs, PPTs, and reference files here.",
      files,
      folders,
    };
  }, [customFiles, customFolders, deletedFileIds, deletedFolderIds, folderRenames]);

  const notesSubject = useMemo(() => {
    const folders = (customFolders[NOTES_WORKSPACE_ID] || [])
      .filter((folder) => !deletedFolderIds.includes(folder.id))
      .map((folder) => ({
        ...folder,
        name: folderRenames[folder.id] || folder.name,
      }));
    const files = (customFiles[NOTES_WORKSPACE_ID] || []).filter(
      (file) => !deletedFileIds.includes(file.id) && !deletedFolderIds.includes(file.folderId),
    );

    return {
      id: NOTES_WORKSPACE_ID,
      title: NOTES_WORKSPACE_TITLE,
      description: "Save Sanjana'ka notes, PDFs, PPTs, images, and extra study materials here.",
      files,
      folders,
    };
  }, [customFiles, customFolders, deletedFileIds, deletedFolderIds, folderRenames]);

  const standaloneWorkspaces = useMemo(() => [materialsSubject, notesSubject], [materialsSubject, notesSubject]);
  const activeWorkspace =
    activeSubject || (activeView === "materials" ? materialsSubject : activeView === "notes" ? notesSubject : null);
  const currentFolderId = activeWorkspace ? currentFolderBySubject[activeWorkspace.id] || null : null;
  const readyPpts = subjects.reduce((total, subject) => total + subject.files.length, 0);
  const activeFolders = subjects.filter((subject) => subject.files.length || subject.folders.length).length;

  const filteredSubjects = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return subjects;
    return subjects.filter((subject) => subject.title.toLowerCase().includes(term));
  }, [query, subjects]);

  const handleLogin = (credentials) => {
    const nextSession = { name: credentials.username, signedInAt: new Date().toISOString() };
    localStorage.setItem("lekha.session", JSON.stringify(nextSession));
    setSession(nextSession);
  };

  const updateAccount = (updates) => {
    setAccount((existing) => {
      const nextAccount = { ...existing, ...updates };
      localStorage.setItem("lekha.account", JSON.stringify(nextAccount));
      return nextAccount;
    });
    if (updates.username) {
      setSession((existing) => {
        if (!existing) return existing;
        const nextSession = { ...existing, name: updates.username };
        localStorage.setItem("lekha.session", JSON.stringify(nextSession));
        return nextSession;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lekha.session");
    setSession(null);
    setActiveView("dashboard");
    setActiveSubjectId(null);
    setSidebarOpen(false);
    setProfileOpen(false);
  };

  const openSubject = (subjectId) => {
    setActiveView("subject");
    setActiveSubjectId(subjectId);
    setCurrentFolderBySubject((existing) => ({ ...existing, [subjectId]: existing[subjectId] || null }));
  };

  const showDashboard = () => {
    setActiveView("dashboard");
    setActiveSubjectId(null);
    setSidebarOpen(false);
  };

  const showSubjects = () => {
    setActiveView("subjects");
    setActiveSubjectId(null);
    setSidebarOpen(false);
  };

  const showMaterials = () => {
    setActiveView("materials");
    setActiveSubjectId(null);
    setCurrentFolderBySubject((existing) => ({
      ...existing,
      [MATERIALS_WORKSPACE_ID]: existing[MATERIALS_WORKSPACE_ID] || null,
    }));
    setSidebarOpen(false);
  };

  const showNotes = () => {
    setActiveView("notes");
    setActiveSubjectId(null);
    setCurrentFolderBySubject((existing) => ({ ...existing, [NOTES_WORKSPACE_ID]: existing[NOTES_WORKSPACE_ID] || null }));
    setSidebarOpen(false);
  };

  const selectSubject = (subjectId) => {
    openSubject(subjectId);
    setSidebarOpen(false);
  };

  const selectFolder = (folderId) => {
    if (!activeWorkspace) return;
    openFolder(activeWorkspace.id, folderId);
    setSidebarOpen(false);
  };

  const openProfileSettings = () => {
    setProfileOpen(true);
    setSidebarOpen(false);
  };

  const openFolder = (subjectId, folderId) => {
    setCurrentFolderBySubject((existing) => ({ ...existing, [subjectId]: folderId }));
  };

  const addFolder = async (subjectId, parentId) => {
    const workspace = standaloneWorkspaces.find((item) => item.id === subjectId) || subjects.find((subject) => subject.id === subjectId);
    const siblingCount = (workspace?.folders || []).filter((folder) => folder.parentId === parentId).length;
    const name = `New folder ${siblingCount + 1}`;

    try {
      if (!isFirebaseConfigured) {
        const folder = { id: makeId(`${subjectId}-folder`), name, parentId };
        setCustomFolders((existing) => addItemsToSubject(existing, subjectId, [folder]));
        setFirebaseError("Cloud sync is not configured in this deployment. Add Firebase and Supabase environment variables in Vercel, then redeploy.");
        return folder.id;
      }

      const folder = await createLibraryFolder({ subjectId, name, parentId });
      setCustomFolders((existing) => addItemsToSubject(existing, subjectId, [folder]));
      setFirebaseError("");
      return folder.id;
    } catch (error) {
      const folder = { id: makeId(`${subjectId}-folder`), name, parentId };
      setCustomFolders((existing) => addItemsToSubject(existing, subjectId, [folder]));
      setFirebaseError(error.message || "Folder saved locally only.");
      return folder.id;
    }
  };

  const renameFolder = async (folderId, name) => {
    const nextName = name.trim();
    if (!nextName) return;
    const folder = [
      ...subjects.flatMap((subject) => subject.folders),
      ...standaloneWorkspaces.flatMap((workspace) => workspace.folders),
    ].find((item) => item.id === folderId);
    if (folder?.source === "firebase") {
      try {
        await renameLibraryFolder(folderId, nextName);
        setFirebaseError("");
      } catch (error) {
        setFirebaseError(error.message || "Folder rename could not be saved to Firebase.");
      }
    }
    setCustomFolders((existing) =>
      Object.fromEntries(
        Object.entries(existing).map(([subjectId, folders]) => [
          subjectId,
          folders.map((item) => (item.id === folderId ? { ...item, name: nextName } : item)),
        ]),
      ),
    );
    setFolderRenames((existing) => ({ ...existing, [folderId]: nextName }));
  };

  const addFiles = async (subjectId, folderId, files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    try {
      if (!isFirebaseConfigured) {
        const nextFiles = selectedFiles.map((file) => getLocalFileRecord(subjectId, folderId, file));
        setCustomFiles((existing) => addItemsToSubject(existing, subjectId, nextFiles));
        setFirebaseError("Cloud sync is not configured in this deployment. Files were added locally only and will disappear after refresh.");
        return;
      }

      const nextFiles = await Promise.all(selectedFiles.map((file) => uploadLibraryFile({ subjectId, folderId, file })));
      setCustomFiles((existing) => addItemsToSubject(existing, subjectId, nextFiles));
      setFirebaseError("");
    } catch (error) {
      const fallbackFiles = selectedFiles.map((file) => getLocalFileRecord(subjectId, folderId, file));
      setCustomFiles((existing) => addItemsToSubject(existing, subjectId, fallbackFiles));
      setFirebaseError(error.message || "Files were added locally only. Firebase upload failed.");
    }
  };

  const deleteFolder = async (subjectId, folderId) => {
    const subject = standaloneWorkspaces.find((item) => item.id === subjectId) || subjects.find((item) => item.id === subjectId);
    if (!subject) return;

    const folderIds = collectDescendantFolderIds(subject.folders, folderId);
    const fileIds = subject.files.filter((file) => folderIds.includes(file.folderId)).map((file) => file.id);
    const firebaseFolders = subject.folders.filter((folder) => folderIds.includes(folder.id) && folder.source === "firebase");
    const firebaseFiles = subject.files.filter((file) => fileIds.includes(file.id) && file.source === "firebase");

    try {
      if (isFirebaseConfigured) {
        await Promise.all([
          ...firebaseFiles.map((file) => deleteLibraryFile(file)),
          ...firebaseFolders.map((folder) => deleteLibraryFolder(folder.id)),
        ]);
      }
      setFirebaseError("");
    } catch (error) {
      setFirebaseError(error.message || "Firebase delete failed. The item was hidden in this browser.");
    }

    setDeletedFolderIds((existing) => [...new Set([...existing, ...folderIds])]);
    setDeletedFileIds((existing) => [...new Set([...existing, ...fileIds])]);
    setCustomFolders((existing) => ({
      ...existing,
      [subjectId]: (existing[subjectId] || []).filter((folder) => !folderIds.includes(folder.id)),
    }));
    setFolderRenames((existing) => {
      const next = { ...existing };
      folderIds.forEach((id) => delete next[id]);
      return next;
    });
    setCustomFiles((existing) => ({
      ...existing,
      [subjectId]: (existing[subjectId] || []).filter((file) => !folderIds.includes(file.folderId)),
    }));
    setCurrentFolderBySubject((existing) => ({
      ...existing,
      [subjectId]: folderIds.includes(existing[subjectId]) ? null : existing[subjectId],
    }));
  };

  const deleteFile = async (subjectId, fileId) => {
    const file = [
      ...subjects.flatMap((subject) => subject.files),
      ...standaloneWorkspaces.flatMap((workspace) => workspace.files),
    ].find((item) => item.id === fileId);
    if (file?.source === "firebase") {
      try {
        await deleteLibraryFile(file);
        setFirebaseError("");
      } catch (error) {
        setFirebaseError(error.message || "Firebase delete failed. The file was hidden in this browser.");
      }
    }
    setDeletedFileIds((existing) => [...new Set([...existing, fileId])]);
    setCustomFiles((existing) => ({
      ...existing,
      [subjectId]: (existing[subjectId] || []).filter((file) => file.id !== fileId),
    }));
  };

  if (!session) {
    return <LoginScreen account={account} onLogin={handleLogin} />;
  }

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        activeSubject={activeSubject}
        activeView={activeView}
        currentFolderId={currentFolderId}
        filteredSubjects={filteredSubjects}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onDashboard={showDashboard}
        onFolderSelect={selectFolder}
        onMaterials={showMaterials}
        onNotes={showNotes}
        onSubjectSelect={selectSubject}
        onSubjects={showSubjects}
        account={account}
        isProfileOpen={profileOpen}
        materialsSubject={materialsSubject}
        notesSubject={notesSubject}
        onOpenProfile={openProfileSettings}
        session={session}
        subjects={subjects}
        onLogout={handleLogout}
      />
      <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} type="button" />

      <main className="workspace">
        <TopBar
          activeSubject={activeSubject}
          activeView={activeView}
          currentFolder={activeWorkspace?.folders.find((folder) => folder.id === currentFolderId)}
          query={query}
          setQuery={setQuery}
          onDashboard={showDashboard}
          onToggleSidebar={() => setSidebarOpen((current) => !current)}
        />

        {activeView === "dashboard" ? (
          <Dashboard subjects={subjects.length} readyPpts={readyPpts} activeFolders={activeFolders} />
        ) : activeView === "subjects" ? (
          <SubjectsWorkspace subjects={filteredSubjects} onOpenSubject={selectSubject} />
        ) : activeWorkspace ? (
          <SubjectWorkspace
            subject={activeWorkspace}
            currentFolderId={currentFolderId}
            firebaseError={firebaseError}
            query={query}
            onAddFolder={() => addFolder(activeWorkspace.id, currentFolderId)}
            onAddFiles={(files) => addFiles(activeWorkspace.id, currentFolderId, files)}
            onOpenFolder={(folderId) => openFolder(activeWorkspace.id, folderId)}
            onRenameFolder={renameFolder}
            onDeleteFolder={(folderId) => deleteFolder(activeWorkspace.id, folderId)}
            onDeleteFile={(fileId) => deleteFile(activeWorkspace.id, fileId)}
            onBackDashboard={isStandaloneWorkspaceId(activeWorkspace.id) ? showDashboard : showSubjects}
            onGoRoot={() => openFolder(activeWorkspace.id, null)}
            onGoFolder={(folderId) => openFolder(activeWorkspace.id, folderId)}
          />
        ) : (
          <Dashboard subjects={subjects.length} readyPpts={readyPpts} activeFolders={activeFolders} />
        )}
      </main>

      {profileOpen && (
        <>
          <button className="settings-scrim" aria-label="Close profile settings" onClick={() => setProfileOpen(false)} type="button" />
          <aside className="profile-drawer" aria-label="Profile settings drawer">
            <ProfileSettings account={account} onClose={() => setProfileOpen(false)} onUpdateAccount={updateAccount} />
          </aside>
        </>
      )}
    </div>
  );
}

function LoginScreen({ account, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const canSubmit = username.trim().length >= 2 && password.trim().length >= 4;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit) {
      setError("Enter a username and password to continue.");
      return;
    }
    if (username.trim() !== account.username || password !== account.password) {
      setError("Invalid username or password.");
      return;
    }
    onLogin({ username: username.trim(), password });
  };

  return (
    <main className="login-page">
      <section className="login-copy">
        <div className="brand large">
          <BrandMark account={account} large />
          <div>
            <strong>Lekha Library</strong>
            <span>BHMS question bank</span>
          </div>
        </div>
        <h1>Open your private study workspace.</h1>
        <p>Notion-style access for BHMS question-bank PPTs, subject folders, and future uploads.</p>
      </section>

      <form className="login-card" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Login</p>
          <h2>Welcome back</h2>
          <p>Enter the approved BHMS library credentials.</p>
        </div>
        <label>
          Username
          <span className="input-shell">
            <User size={17} />
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Enter username" />
          </span>
        </label>
        <label>
          Password
          <span className="input-shell">
            <LockKeyhole size={17} />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
            />
            <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label="Toggle password">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary-btn" disabled={!canSubmit}>
          Enter dashboard
        </button>
      </form>
    </main>
  );
}

function Sidebar({
  activeSubject,
  activeView,
  account,
  currentFolderId,
  filteredSubjects,
  isOpen,
  onClose,
  onDashboard,
  onFolderSelect,
  onMaterials,
  onNotes,
  onSubjectSelect,
  onSubjects,
  isProfileOpen,
  materialsSubject,
  notesSubject,
  onOpenProfile,
  session,
  subjects,
  onLogout,
}) {
  const activeTree = activeSubject || (activeView === "materials" ? materialsSubject : activeView === "notes" ? notesSubject : null);
  const rootFolders = activeTree?.folders.filter((folder) => folder.parentId === null) || [];
  const childFolders = activeTree?.folders.filter((folder) => folder.parentId === currentFolderId && folder.parentId !== null) || [];

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`} aria-label="Library navigation">
      <div className="sidebar-top">
        <div className="sidebar-brand-row">
          <div className="brand">
            <BrandMark account={account} />
            <div>
              <strong>Lekha Library</strong>
              <span>BHMS question bank</span>
            </div>
          </div>
          <button className="sidebar-close" onClick={onClose} type="button" aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <div className="mobile-search-spacer" />

        <div className="desktop-brand brand">
          <BrandMark account={account} />
          <div>
            <strong>Lekha Library</strong>
            <span>BHMS question bank</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <button className={`nav-item ${activeView === "dashboard" ? "active" : ""}`} onClick={onDashboard}>
            <Home size={17} />
            <span>Dashboard</span>
          </button>
          <button className={`nav-item ${activeView === "subjects" || activeView === "subject" ? "active" : ""}`} onClick={onSubjects}>
            <Library size={17} />
            <span>Subjects</span>
          </button>
          <button className={`nav-item ${activeView === "materials" ? "active" : ""}`} onClick={onMaterials}>
            <Box size={17} />
            <span>Materials</span>
          </button>
          <button className={`nav-item ${activeView === "notes" ? "active" : ""}`} onClick={onNotes} type="button">
            <ClipboardList size={17} />
            <span>{NOTES_WORKSPACE_TITLE}</span>
          </button>
        </nav>

        {!activeTree ? (
          <div className="subject-list">
            <p>Subjects</p>
            {filteredSubjects.map((subject) => (
              <button className="subject-tab" key={subject.id} onClick={() => onSubjectSelect(subject.id)}>
                <Folder size={16} />
                <span>{subject.title}</span>
                <small>{subject.files.length}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="subject-list">
            <p>{isStandaloneWorkspaceId(activeTree.id) ? activeTree.title : "Subject"}</p>
            <button className="subject-tab active" onClick={() => onFolderSelect(null)}>
              {activeTree.id === MATERIALS_WORKSPACE_ID ? (
                <Box size={16} />
              ) : activeTree.id === NOTES_WORKSPACE_ID ? (
                <ClipboardList size={16} />
              ) : (
                <BookOpen size={16} />
              )}
              <span>{activeTree.title}</span>
              <small>{activeTree.files.length}</small>
            </button>
            <div className="page-tree">
              <p>Folders</p>
              {rootFolders.map((folder) => (
                <button
                  className={`tree-item ${currentFolderId === folder.id ? "active" : ""}`}
                  key={folder.id}
                  onClick={() => onFolderSelect(folder.id)}
                  type="button"
                >
                  <Folder size={15} />
                  <span>{folder.name}</span>
                </button>
              ))}
              {childFolders.map((folder) => (
                <button className="tree-item child" key={folder.id} onClick={() => onFolderSelect(folder.id)} type="button">
                  <Folder size={15} />
                  <span>{folder.name}</span>
                </button>
              ))}
              {!rootFolders.length && <span className="tree-empty">No folders yet</span>}
            </div>
            <button className="back-link" onClick={onDashboard}>
              <ChevronRight size={15} />
              Back to dashboard
            </button>
          </div>
        )}
      </div>

      <div className="sidebar-bottom">
        <button className={`profile-card profile-trigger ${isProfileOpen ? "active" : ""}`} onClick={onOpenProfile} type="button">
          <AccountAvatar account={account} size="small" />
          <div>
            <strong>{session.name}</strong>
            <span>{subjects.length} subjects available</span>
          </div>
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}

function BrandMark({ account, large = false }) {
  return (
    <span className={`brand-mark ${account.profileImage ? "with-image" : ""}`}>
      {account.profileImage ? <img src={account.profileImage} alt="" /> : <BookOpen size={large ? 24 : 19} />}
    </span>
  );
}

function AccountAvatar({ account, size = "medium" }) {
  return (
    <span className={`account-avatar ${size}`}>
      {account.profileImage ? <img src={account.profileImage} alt="" /> : <CircleUserRound size={size === "large" ? 34 : 19} />}
    </span>
  );
}

function ProfileSettings({ account, onClose, onUpdateAccount }) {
  const imageInputRef = useRef(null);
  const [usernameValue, setUsernameValue] = useState(account.username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the profile photo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onUpdateAccount({ profileImage: reader.result });
      setError("");
      setMessage("Profile image updated.");
    };
    reader.readAsDataURL(file);
  };

  const handleUsernameSave = (event) => {
    event.preventDefault();
    const nextUsername = usernameValue.trim();
    setError("");
    setMessage("");

    if (nextUsername.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    onUpdateAccount({ username: nextUsername });
    setUsernameValue(nextUsername);
    setMessage("Username updated successfully.");
  };

  const handlePasswordSave = (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (currentPassword !== account.password) {
      setError("Current password is incorrect.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    onUpdateAccount({ password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMessage("Password changed successfully.");
  };

  return (
    <section className="profile-panel" aria-label="Profile settings">
      <div className="profile-panel-head">
        <div className="profile-title">
          <AccountAvatar account={account} size="large" />
          <div>
            <strong>{account.username}</strong>
            <span>Profile settings</span>
          </div>
        </div>
        <button className="profile-close" onClick={onClose} type="button" aria-label="Close profile settings">
          <X size={16} />
        </button>
      </div>

      <div className="profile-actions-row">
        <button className="ghost-btn" onClick={() => imageInputRef.current?.click()} type="button">
          <User size={15} />
          Update image
        </button>
        <button className="ghost-btn" onClick={() => onUpdateAccount({ profileImage: "" })} type="button" disabled={!account.profileImage}>
          <Trash2 size={15} />
          Remove
        </button>
        <input ref={imageInputRef} className="hidden-input" type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <form className="password-form" onSubmit={handleUsernameSave}>
        <label>
          Username
          <input value={usernameValue} onChange={(event) => setUsernameValue(event.target.value)} type="text" />
        </label>
        <button className="primary-btn" type="submit">
          Change username
        </button>
      </form>

      {error && <p className="profile-error">{error}</p>}
      {message && <p className="profile-message">{message}</p>}

      <form className="password-form" onSubmit={handlePasswordSave}>
        <label>
          Current password
          <input value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} type="password" />
        </label>
        <label>
          New password
          <input value={newPassword} onChange={(event) => setNewPassword(event.target.value)} type="password" />
        </label>
        <label>
          Confirm password
          <input value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} type="password" />
        </label>
        <button className="primary-btn" type="submit">
          Change password
        </button>
      </form>
    </section>
  );
}

function TopBar({ activeSubject, activeView, currentFolder, query, setQuery, onDashboard, onToggleSidebar }) {
  const pageTitle =
    activeSubject?.title ||
    (activeView === "subjects"
      ? "Subjects"
      : activeView === "materials"
        ? "Materials"
        : activeView === "notes"
          ? NOTES_WORKSPACE_TITLE
          : "");

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button" onClick={onToggleSidebar} type="button" aria-label="Open navigation">
          <PanelLeft size={18} />
        </button>
        <div className="breadcrumb">
          <button onClick={onDashboard}>Dashboard</button>
          {pageTitle && (
            <>
              <ChevronRight size={14} />
              <span>{pageTitle}</span>
            </>
          )}
          {currentFolder && (
            <>
              <ChevronRight size={14} />
              <span>{currentFolder.name}</span>
            </>
          )}
        </div>
      </div>
      <label className="search-box">
        <Search size={16} />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search subjects, folders, or PPT files..." />
      </label>
    </header>
  );
}

function Dashboard({ subjects, readyPpts, activeFolders }) {
  return (
    <section className="dashboard-page">
      <div className="dashboard-grid">
        <DashboardTile icon={Library} value={subjects} label="Subjects" />
        <DashboardTile icon={Presentation} value={readyPpts} label="Ready PPTs" />
        <DashboardTile icon={Folder} value={activeFolders} label="Active folders" />
      </div>

      <section className="dashboard-info">
        <div className="info-block">
          <div className="block-heading dashboard-heading">
            <div>
              <h2>July 2026 exam timetable</h2>
              <p>Third Professional B.H.M.S. Degree Course</p>
            </div>
            <a className="mini-action" href="/resources/timetable/BHMSJuly2026TimeTable.pdf" target="_blank" rel="noreferrer">
              <ExternalLink size={15} />
              Official PDF
            </a>
          </div>
          <div className="exam-summary">
            <article>
              <CalendarDays size={17} />
              <strong>20-07-2026</strong>
              <span>Exams start</span>
            </article>
            <article>
              <Clock3 size={17} />
              <strong>9.30 am</strong>
              <span>Common start time</span>
            </article>
            <article>
              <ClipboardList size={17} />
              <strong>{examTimetable.length}</strong>
              <span>Papers listed</span>
            </article>
          </div>
          <div className="exam-table">
            <div className="exam-row exam-head">
              <span>Date</span>
              <span>Paper</span>
              <span>Subject</span>
              <span>Code</span>
            </div>
            {examTimetable.map((exam) => (
              <div className="exam-row" key={`${exam.paper}-${exam.code}`}>
                <span>
                  <strong>{exam.date}</strong>
                  <small>
                    {exam.day} | {exam.time}
                  </small>
                </span>
                <span>{exam.paper}</span>
                <span>
                  {exam.subject}
                  {exam.note && <small className="date-note">{exam.note}</small>}
                </span>
                <span>{exam.code}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}

function DashboardTile({ icon: Icon, value, label }) {
  return (
    <article className="dashboard-tile">
      <Icon size={19} />
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function SubjectsWorkspace({ subjects, onOpenSubject }) {
  return (
    <section className="subject-workspace subjects-directory">
      <div className="page-title-row">
        <div>
          <div className="page-icon">
            <Library size={34} />
          </div>
          <h1>Subjects</h1>
          <p>Open a subject to manage its folders, PPTs, PDFs, and future question-bank files.</p>
        </div>
      </div>

      <div className="database-toolbar">
        <div className="view-tabs" aria-label="Subject database">
          <button className="active" type="button">
            <Library size={15} />
            All subjects
          </button>
        </div>
        <span className="directory-count">{subjects.length} visible</span>
      </div>

      <div className="subject-directory-list">
        {subjects.map((subject) => {
          const isReady = subject.files.length > 0 || subject.folders.length > 0;
          return (
            <button className="subject-directory-row" key={subject.id} onClick={() => onOpenSubject(subject.id)} type="button">
              <span className={`directory-icon ${isReady ? "ready" : ""}`}>
                {isReady ? <BookOpen size={18} /> : <Folder size={18} />}
              </span>
              <span className="directory-copy">
                <strong>{subject.title}</strong>
                <small>{subject.description}</small>
              </span>
              <span className="directory-meta">
                <strong>{subject.files.length}</strong>
                <small>{subject.files.length === 1 ? "file" : "files"}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SubjectWorkspace({
  subject,
  currentFolderId,
  firebaseError,
  query,
  onAddFolder,
  onAddFiles,
  onOpenFolder,
  onRenameFolder,
  onDeleteFolder,
  onDeleteFile,
  onBackDashboard,
  onGoRoot,
  onGoFolder,
}) {
  const fileInputRef = useRef(null);
  const [renamingFolderId, setRenamingFolderId] = useState(null);
  const [openItemId, setOpenItemId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const term = query.trim().toLowerCase();
  const currentFolder = subject.folders.find((folder) => folder.id === currentFolderId) || null;
  const path = getFolderPath(subject.folders, currentFolderId);
  const backTargetFolderId = currentFolder ? currentFolder.parentId : null;
  const rootBackLabel = isStandaloneWorkspaceId(subject.id) ? "Back to dashboard" : "Back to subjects";
  const backLabel = currentFolder ? `Back to ${backTargetFolderId ? path[path.length - 2]?.name || subject.title : subject.title}` : rootBackLabel;

  const childFolders = subject.folders
    .filter((folder) => folder.parentId === currentFolderId)
    .filter((folder) => !term || folder.name.toLowerCase().includes(term));
  const files = subject.files
    .filter((file) => file.folderId === currentFolderId)
    .filter((file) => !term || file.title.toLowerCase().includes(term) || file.description.toLowerCase().includes(term));

  const startRename = (folder) => {
    setOpenItemId(folder.id);
    setRenamingFolderId(folder.id);
    setRenameValue(folder.name);
  };

  const saveRename = () => {
    if (!renamingFolderId) return;
    onRenameFolder(renamingFolderId, renameValue);
    setRenamingFolderId(null);
    setRenameValue("");
  };

  return (
    <section className="subject-workspace">
      <button className="workspace-back-btn" onClick={() => (currentFolder ? onGoFolder(backTargetFolderId) : onBackDashboard())} type="button">
        <ChevronRight size={15} />
        {backLabel}
      </button>

      <div className="page-title-row">
        <div>
          <div className="page-icon">
            {currentFolder ? (
              <Folder size={34} />
            ) : subject.id === MATERIALS_WORKSPACE_ID ? (
              <Box size={34} />
            ) : subject.id === NOTES_WORKSPACE_ID ? (
              <ClipboardList size={34} />
            ) : (
              <BookOpen size={34} />
            )}
          </div>
          <h1>{currentFolder ? currentFolder.name : subject.title}</h1>
          <p>{currentFolder ? `Inside ${subject.title}. Create folders and add files here.` : subject.description}</p>
        </div>
      </div>

      <div className="folder-breadcrumbs" aria-label="Folder path">
        <button onClick={onGoRoot}>{subject.title}</button>
        {path.map((folder) => (
          <React.Fragment key={folder.id}>
            <ChevronRight size={14} />
            <button onClick={() => onGoFolder(folder.id)}>{folder.name}</button>
          </React.Fragment>
        ))}
      </div>

      <div className="database-toolbar">
        <div className="view-tabs" aria-label="Workspace actions">
          <button className="active" type="button">
            <Folder size={15} />
            Grid
          </button>
          <button type="button">
            <Presentation size={15} />
            Files
          </button>
        </div>
        <div className="workspace-actions">
          <button className="ghost-btn" onClick={onAddFolder}>
            <FolderPlus size={16} />
            New folder
          </button>
          <button className="primary-btn" onClick={() => fileInputRef.current?.click()}>
            <FilePlus2 size={16} />
            Add files
          </button>
          <input
            ref={fileInputRef}
            className="hidden-input"
            type="file"
            multiple
            accept=".ppt,.pptx,.pdf,.doc,.docx"
            onChange={(event) => {
              onAddFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </div>
      </div>

      {firebaseError && (
        <div className="firebase-warning">
          <strong>Firebase sync needs attention</strong>
          <span>{firebaseError}</span>
        </div>
      )}

      <div className="accordion-list">
        {childFolders.map((folder) => (
          <FolderRow
            folder={folder}
            itemCount={countFolderItems(subject, folder.id)}
            isRenaming={renamingFolderId === folder.id}
            renameValue={renameValue}
            onOpen={() => onOpenFolder(folder.id)}
            onRename={() => startRename(folder)}
            onRenameChange={setRenameValue}
            onRenameCancel={() => setRenamingFolderId(null)}
            onRenameSave={saveRename}
            onDelete={() => onDeleteFolder(folder.id)}
            key={folder.id}
          />
        ))}
        {files.map((file) => (
          <FileAccordionItem
            file={file}
            isOpen={openItemId === file.id}
            onToggle={() => setOpenItemId((current) => (current === file.id ? null : file.id))}
            onDelete={() => onDeleteFile(file.id)}
            key={file.id}
          />
        ))}
      </div>

      {!childFolders.length && !files.length && (
        <EmptyBlock
          title="This folder is empty"
          body="Create a folder first, open it, then add files inside. That matches the File Explorer workflow you described."
        />
      )}
    </section>
  );
}

function FolderRow({
  folder,
  itemCount,
  isRenaming,
  renameValue,
  onOpen,
  onRename,
  onRenameCancel,
  onRenameChange,
  onRenameSave,
  onDelete,
}) {
  const confirmDelete = () => {
    if (window.confirm(`Delete "${folder.name}" and everything inside it?`)) {
      onDelete();
    }
  };

  return (
    <article className="accordion-item folder-row">
      {isRenaming ? (
        <div className="accordion-panel folder-rename-panel">
          <span className="rename-control">
            <input
              autoFocus
              value={renameValue}
              onChange={(event) => onRenameChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") onRenameSave();
                if (event.key === "Escape") onRenameCancel();
              }}
            />
            <button onClick={onRenameSave} aria-label="Save folder name">
              <Check size={15} />
            </button>
            <button onClick={onRenameCancel} aria-label="Cancel rename">
              <X size={15} />
            </button>
          </span>
        </div>
      ) : (
        <div className="folder-row-inner">
          <button className="accordion-summary folder-open-summary" onClick={onOpen} type="button">
            <ChevronRight size={16} />
            <span className="accordion-icon folder">
              <Folder size={18} />
            </span>
            <span className="accordion-title">{folder.name}</span>
            <span className="accordion-meta">{itemCount} items</span>
          </button>
          <div className="folder-row-actions">
            <button className="action-chip" onClick={onRename} type="button" aria-label={`Rename ${folder.name}`}>
              <Pencil size={14} />
              Rename
            </button>
            <button className="action-chip danger" onClick={confirmDelete} type="button" aria-label={`Delete ${folder.name}`}>
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function FileAccordionItem({ file, isOpen, onToggle, onDelete }) {
  const url = file.downloadUrl || file.localUrl || resourceUrl(file.fileName);
  const isPresentation = ["PPT", "PPTX"].includes(file.type);
  const openFile = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    let accessUrl;
    try {
      accessUrl = await getLibraryFileUrl(file, url);
    } catch (error) {
      window.alert(error.message);
      return;
    }

    const absoluteUrl = file.localUrl || new URL(accessUrl, window.location.href).href;

    if (isPresentation && !file.localUrl) {
      const isLocalPreview = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (isLocalPreview) {
        window.location.href = `ms-powerpoint:ofe|u|${absoluteUrl}`;
      } else {
        window.open(`https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(absoluteUrl)}`, "_blank", "noopener,noreferrer");
      }
      return;
    }

    window.open(accessUrl, "_blank", "noopener,noreferrer");
  };
  const confirmDelete = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (window.confirm(`Delete "${file.title}"?`)) {
      onDelete();
    }
  };

  return (
    <article className={`accordion-item ${isOpen ? "open" : ""}`}>
      <button className="accordion-summary" onClick={onToggle} type="button" aria-expanded={isOpen}>
        <ChevronRight className="accordion-chevron" size={16} />
        <span className="accordion-icon file">
          <Presentation size={18} />
        </span>
        <span className="accordion-title">{file.title}</span>
        <span className="accordion-meta">{file.type} | {file.period}</span>
      </button>
      {isOpen && (
        <div className="accordion-panel">
          <p>{file.description}</p>
          <div className="accordion-actions">
            <button className="action-chip" onClick={openFile} type="button">
              <ExternalLink size={14} />
              Open file
            </button>
            <DownloadLink file={file} url={url} />
            <button className="action-chip danger" onClick={confirmDelete} type="button">
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

function DownloadLink({ file, url }) {
  const downloadFile = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    let accessUrl;
    try {
      accessUrl = await getLibraryFileUrl(file, url, { download: true });
      const response = await fetch(accessUrl);
      if (!response.ok) {
        throw new Error("The file could not be downloaded.");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = file.fileName || file.title || "download";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <button className="action-chip" onClick={downloadFile} type="button">
      <Download size={14} />
      Download
    </button>
  );
}

function EmptyBlock({ title, body }) {
  return (
    <div className="empty-block">
      <Box size={22} />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}

function getFolderPath(folders, folderId) {
  const path = [];
  let current = folders.find((folder) => folder.id === folderId);
  while (current) {
    path.unshift(current);
    current = folders.find((folder) => folder.id === current.parentId);
  }
  return path;
}

function countFolderItems(subject, folderId) {
  const childFolders = subject.folders.filter((folder) => folder.parentId === folderId).length;
  const childFiles = subject.files.filter((file) => file.folderId === folderId).length;
  return childFolders + childFiles;
}

function collectDescendantFolderIds(folders, folderId) {
  const ids = [folderId];
  for (const folder of folders) {
    if (folder.parentId === folderId) {
      ids.push(...collectDescendantFolderIds(folders, folder.id));
    }
  }
  return ids;
}
