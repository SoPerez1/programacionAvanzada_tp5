import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const API_URL = `${API_BASE}/tasks`

const INITIAL_FORM_STATE = {
  project_name: '',
  activity_type: '',
  status: 'Pendiente',
  summary: '',
  description: '',
  priority: '',
  reporter: '',
  assignee: '',
  precondition: '',
  closed_at: '',
  sprint: ''
}

// Inline Icons (Lucide-like)
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  LayoutList: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="3" y="3" width="7" height="7" rx="1"></rect><line x1="14" y1="4" x2="21" y2="4"></line><line x1="14" y1="9" x2="21" y2="9"></line><line x1="14" y1="15" x2="21" y2="15"></line><line x1="14" y1="20" x2="21" y2="20"></line></svg>,
  Clock: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
}

function App() {
  const [tasks, setTasks] = useState([])
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL)
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.project_name) {
      alert("El Nombre del Proyecto es obligatorio")
      return
    }

    setLoading(true)
    try {
      if (editingId) {
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      setFormData(INITIAL_FORM_STATE)
      setEditingId(null)
      fetchTasks()
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (task) => {
    const formTask = { ...task }
    if (formTask.closed_at) {
      formTask.closed_at = new Date(formTask.closed_at).toISOString().split('T')[0]
    }
    setFormData({
      project_name: formTask.project_name || '',
      activity_type: formTask.activity_type || '',
      status: formTask.status || 'Pendiente',
      summary: formTask.summary || '',
      description: formTask.description || '',
      priority: formTask.priority || '',
      reporter: formTask.reporter || '',
      assignee: formTask.assignee || '',
      precondition: formTask.precondition || '',
      closed_at: formTask.closed_at || '',
      sprint: formTask.sprint || ''
    })
    setEditingId(task.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id)
  }

  const confirmDelete = async () => {
    if (!deleteConfirmId) return
    try {
      await fetch(`${API_URL}/${deleteConfirmId}`, { method: 'DELETE' })
      fetchTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handleComplete = async (task) => {
    try {
      await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: 'Finalizada' }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const getStatusClass = (status) => {
    if (status === 'Finalizada') return 'badge-status-finalizada'
    if (status === 'En Progreso') return 'badge-status-progreso'
    return 'badge-status-pendiente'
  }

  const getPriorityClass = (priority) => {
    if (priority === 'Alta' || priority === 'Crítica') return 'badge-priority-alta'
    if (priority === 'Media') return 'badge-priority-media'
    return 'badge-priority-baja'
  }

  return (
    <div className="app-container">
      <header className="header animate-fade-in">
        <h1>Nexus Tracker</h1>
        <p>Sistema Avanzado de Gestión de Proyectos</p>
      </header>

      {/* Formulario */}
      <aside className="task-form-wrapper animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <section className="glass-panel task-form">
          <h2>
            <Icons.Plus />
            {editingId ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <form onSubmit={handleSubmit} className="form-grid">
            
            <div className="form-group">
              <label>Nombre del Proyecto *</label>
              <input className="form-control" name="project_name" value={formData.project_name} onChange={handleInputChange} required placeholder="Ej: E-commerce V2" />
            </div>

            <div className="form-group row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Tipo</label>
                <select className="form-control" name="activity_type" value={formData.activity_type} onChange={handleInputChange}>
                  <option value="">Seleccionar...</option>
                  <option value="Feature">Feature</option>
                  <option value="Bug">Bug</option>
                  <option value="Refactor">Refactor</option>
                  <option value="Investigación">Investigación</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Estado</label>
                <select className="form-control" name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Finalizada">Finalizada</option>
                </select>
              </div>
            </div>

            <div className="form-group row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Prioridad</label>
                <select className="form-control" name="priority" value={formData.priority} onChange={handleInputChange}>
                  <option value="">Seleccionar...</option>
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Sprint</label>
                <input className="form-control" name="sprint" value={formData.sprint} onChange={handleInputChange} placeholder="Ej. Sprint 4" />
              </div>
            </div>

            <div className="form-group">
              <label>Resumen</label>
              <input className="form-control" name="summary" value={formData.summary} onChange={handleInputChange} placeholder="Breve resumen de la tarea" />
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea className="form-control" name="description" value={formData.description} onChange={handleInputChange} placeholder="Detalles completos..." />
            </div>

            <div className="form-group">
              <label>Precondición</label>
              <textarea className="form-control" name="precondition" value={formData.precondition} onChange={handleInputChange} placeholder="Condiciones previas necesarias..." />
            </div>

            <div className="form-group row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Asignado a</label>
                <input className="form-control" name="assignee" value={formData.assignee} onChange={handleInputChange} placeholder="Nombre o ID" />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Reportero</label>
                <input className="form-control" name="reporter" value={formData.reporter} onChange={handleInputChange} placeholder="Quien reporta" />
              </div>
            </div>

            <div className="form-group row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha de Creación</label>
                <input type="date" className="form-control" name="created_at" value={formData.created_at || new Date().toISOString().split('T')[0]} readOnly disabled style={{opacity: 0.7}} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Fecha de Cierre</label>
                <input type="date" className="form-control" name="closed_at" value={formData.closed_at} onChange={handleInputChange} />
              </div>
            </div>

            <div className="form-actions">
              {editingId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData(INITIAL_FORM_STATE); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Icons.Check />
                {loading ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Tarea')}
              </button>
            </div>
          </form>
        </section>
      </aside>

      {/* Listado de tareas */}
      <main className="task-list-container animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="task-list-header">
          <h2><Icons.LayoutList style={{display: 'inline', marginRight: '8px', verticalAlign: 'middle', color: 'var(--primary)'}}/> Tablero de Tareas</h2>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <Icons.LayoutList />
            <h3>No hay tareas pendientes</h3>
            <p>Crea tu primera tarea usando el formulario de la izquierda.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-card-header">
                  <div>
                    <h3 className="task-title">{task.project_name}</h3>
                    <span className="task-id">#{task.id}</span>
                  </div>
                </div>
                
                <p className="task-desc">{task.summary || 'Sin resumen provisto.'}</p>

                <div className="badges-container">
                  <span className={`badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                  {task.priority && (
                    <span className={`badge ${getPriorityClass(task.priority)}`}>
                      Prioridad: {task.priority}
                    </span>
                  )}
                  {task.activity_type && (
                    <span className="badge" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)'}}>
                      {task.activity_type}
                    </span>
                  )}
                </div>

                <div className="task-meta">
                  <div className="meta-item">
                    <Icons.User />
                    {task.assignee || 'Sin asignar'}
                  </div>
                  <div className="meta-item">
                    <Icons.Clock />
                    {new Date(task.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="task-actions">
                  {task.status !== 'Finalizada' && (
                    <button className="btn-icon success" onClick={() => handleComplete(task)} title="Marcar Finalizada">
                      <Icons.Check />
                    </button>
                  )}
                  <button className="btn-icon" onClick={() => handleEdit(task)} title="Editar Tarea">
                    <Icons.Edit />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDeleteClick(task.id)} title="Eliminar Tarea">
                    <Icons.Trash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de confirmacion de eliminacion */}
      {deleteConfirmId && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel" style={{textAlign: 'center', padding: '2rem', maxWidth: '400px', margin: 'auto', marginTop: '20vh'}}>
            <div style={{color: 'var(--danger)', marginBottom: '1rem'}}>
              <Icons.Trash style={{width: 48, height: 48}} />
            </div>
            <h3 style={{marginBottom: '0.5rem'}}>Confirmar Eliminación</h3>
            <p style={{color: 'var(--text-secondary)', marginBottom: '1.5rem'}}>
              ¿Estás seguro de que deseas eliminar esta tarea de forma permanente? Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions" style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
              <button className="btn btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancelar
              </button>
              <button className="btn btn-primary danger" style={{backgroundColor: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={confirmDelete}>
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
