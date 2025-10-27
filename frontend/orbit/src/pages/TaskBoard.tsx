// import React, { useState } from 'react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { tasksAPI } from '@/lib/api';

// interface Task {
//   id: number;
//   title: string;
//   description?: string;
//   phase: string;
//   status: 'To Do' | 'In Progress' | 'Completed';
//   priority: 'Low' | 'Medium' | 'High';
//   due_date?: string;
//   user_university_id: number;
//   university_name?: string;
//   created_at: string;
//   updated_at: string;
// }

// const TASK_PHASES = [
//   'Research',
//   'Standardized Tests', 
//   'Essays',
//   'Resume',
//   'Recommendations',
//   'Submission & Review',
//   'Enrollment'
// ];

// const PRIORITY_COLORS = {
//   Low: 'bg-gray-100 text-gray-800',
//   Medium: 'bg-yellow-100 text-yellow-800',
//   High: 'bg-red-100 text-red-800'
// };

// const STATUS_COLUMNS = [
//   { id: 'To Do', title: 'To Do', color: 'bg-gray-50' },
//   { id: 'In Progress', title: 'In Progress', color: 'bg-blue-50' },
//   { id: 'Completed', title: 'Completed', color: 'bg-green-50' }
// ];

// export function TaskBoard() {
//   const [selectedPhase, setSelectedPhase] = useState<string>('All');
//   const [selectedUniversity, setSelectedUniversity] = useState<string>('All');
//   const queryClient = useQueryClient();

//   // Fetch tasks
//   const { data: tasks = [], isLoading } = useQuery({
//     queryKey: ['tasks'],
//     queryFn: () => tasksAPI.getAll()
//   });

//   // Update task status mutation
//   const updateTaskMutation = useMutation({
//     mutationFn: ({ taskId, updates }: { taskId: number; updates: Partial<Task> }) =>
//       tasksAPI.update(taskId, updates),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['tasks'] });
//     }
//   });

//   // Filter tasks
//   const filteredTasks = tasks.filter((task: Task) => {
//     const phaseMatch = selectedPhase === 'All' || task.phase === selectedPhase;
//     const universityMatch = selectedUniversity === 'All' || task.university_name === selectedUniversity;
//     return phaseMatch && universityMatch;
//   });

//   // Group tasks by status
//   const tasksByStatus = STATUS_COLUMNS.reduce((acc, column) => {
//     acc[column.id] = filteredTasks.filter((task: Task) => task.status === column.id);
//     return acc;
//   }, {} as Record<string, Task[]>);

//   // Handle status change
//   const handleStatusChange = (taskId: number, newStatus: 'To Do' | 'In Progress' | 'Completed') => {
//     updateTaskMutation.mutate({
//       taskId,
//       updates: { status: newStatus }
//     });
//   };

//   // Get unique universities for filter
//   const universities = Array.from(new Set(tasks.map((task: Task) => task.university_name).filter(Boolean)));

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[1, 2, 3].map(i => (
//                 <div key={i} className="bg-gray-200 rounded-lg h-96"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Task Board</h1>
//           <p className="text-gray-600">Manage your application tasks with drag-and-drop functionality.</p>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex flex-wrap gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Phase</label>
//               <select
//                 value={selectedPhase}
//                 onChange={(e) => setSelectedPhase(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All Phases</option>
//                 {TASK_PHASES.map(phase => (
//                   <option key={phase} value={phase}>{phase}</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Filter by University</label>
//               <select
//                 value={selectedUniversity}
//                 onChange={(e) => setSelectedUniversity(e.target.value)}
//                 className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 <option value="All">All Universities</option>
//                 {universities.map(university => (
//                   <option key={university} value={university}>{university}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Task Statistics */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           {STATUS_COLUMNS.map(column => (
//             <div key={column.id} className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center justify-between mb-2">
//                 <h3 className="text-lg font-semibold text-gray-900">{column.title}</h3>
//                 <span className="text-2xl font-bold text-gray-600">{tasksByStatus[column.id]?.length || 0}</span>
//               </div>
//               <div className="text-sm text-gray-500">
//                 {column.id === 'To Do' && 'Tasks waiting to be started'}
//                 {column.id === 'In Progress' && 'Tasks currently being worked on'}
//                 {column.id === 'Completed' && 'Tasks that have been finished'}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Kanban Board */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {STATUS_COLUMNS.map(column => (
//             <div key={column.id} className={`rounded-lg p-4 ${column.color}`}>
//               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
//                 {column.title}
//                 <span className="ml-2 px-2 py-1 bg-white rounded-full text-sm font-medium text-gray-600">
//                   {tasksByStatus[column.id]?.length || 0}
//                 </span>
//               </h3>
              
//               <div className="min-h-[400px] space-y-3">
//                 {tasksByStatus[column.id]?.map((task: Task) => (
//                   <div
//                     key={task.id}
//                     className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${
//                       task.priority === 'High' ? 'border-red-500' :
//                       task.priority === 'Medium' ? 'border-yellow-500' : 'border-gray-300'
//                     }`}
//                   >
//                     <div className="flex items-start justify-between mb-2">
//                       <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
//                         {task.priority}
//                       </span>
//                     </div>
                    
//                     {task.description && (
//                       <p className="text-sm text-gray-600 mb-2">{task.description}</p>
//                     )}
                    
//                     <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
//                       <span className="bg-gray-100 px-2 py-1 rounded">{task.phase}</span>
//                       {task.university_name && (
//                         <span className="truncate max-w-[120px]" title={task.university_name}>
//                           {task.university_name}
//                         </span>
//                       )}
//                     </div>
                    
//                     {task.due_date && (
//                       <div className="mb-3 text-xs text-gray-500">
//                         Due: {new Date(task.due_date).toLocaleDateString()}
//                       </div>
//                     )}

//                     {/* Status Change Buttons */}
//                     <div className="flex gap-1">
//                       {STATUS_COLUMNS.filter(col => col.id !== task.status).map(col => (
//                         <button
//                           key={col.id}
//                           onClick={() => handleStatusChange(task.id, col.id as 'To Do' | 'In Progress' | 'Completed')}
//                           className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
//                         >
//                           Move to {col.title}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Empty State */}
//         {filteredTasks.length === 0 && (
//           <div className="text-center py-12">
//             <div className="text-gray-400 text-6xl mb-4">📋</div>
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
//             <p className="text-gray-600 mb-4">
//               {selectedPhase !== 'All' || selectedUniversity !== 'All' 
//                 ? 'Try adjusting your filters to see more tasks.'
//                 : 'Add universities to your list to start generating tasks.'}
//             </p>
//             <button
//               onClick={() => {
//                 setSelectedPhase('All');
//                 setSelectedUniversity('All');
//               }}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Clear Filters
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
