// import React, { useState, useMemo } from 'react';
// import { useQuery } from '@tanstack/react-query';
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
//   application_deadline?: string;
//   created_at: string;
//   updated_at: string;
// }

// interface TimelineTask extends Task {
//   startDate: Date;
//   endDate: Date;
//   duration: number;
//   color: string;
// }

// const PHASE_COLORS = {
//   'Research': '#3B82F6',
//   'Standardized Tests': '#EF4444',
//   'Essays': '#10B981',
//   'Resume': '#F59E0B',
//   'Recommendations': '#8B5CF6',
//   'Submission & Review': '#EC4899',
//   'Enrollment': '#06B6D4'
// };

// const STATUS_COLORS = {
//   'To Do': '#6B7280',
//   'In Progress': '#3B82F6',
//   'Completed': '#10B981'
// };

// export function Timeline() {
//   const [selectedUniversity, setSelectedUniversity] = useState<string>('All');
//   const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

//   // Fetch tasks
//   const { data: tasks = [], isLoading } = useQuery({
//     queryKey: ['tasks'],
//     queryFn: () => tasksAPI.getAll()
//   });

//   // Process tasks for timeline
//   const timelineTasks = useMemo(() => {
//     const filteredTasks = selectedUniversity === 'All' 
//       ? tasks 
//       : tasks.filter((task: Task) => task.university_name === selectedUniversity);

//     return filteredTasks.map((task: Task): TimelineTask => {
//       const dueDate = task.due_date ? new Date(task.due_date) : new Date();
//       const startDate = new Date(dueDate);
//       startDate.setDate(startDate.getDate() - 7); // 7 days before due date
      
//       return {
//         ...task,
//         startDate,
//         endDate: dueDate,
//         duration: 7,
//         color: PHASE_COLORS[task.phase as keyof typeof PHASE_COLORS] || '#6B7280'
//       };
//     });
//   }, [tasks, selectedUniversity]);

//   // Get date range
//   const dateRange = useMemo(() => {
//     if (timelineTasks.length === 0) {
//       const today = new Date();
//       return {
//         start: new Date(today.getFullYear(), today.getMonth(), 1),
//         end: new Date(today.getFullYear(), today.getMonth() + 3, 0)
//       };
//     }

//     const dates = timelineTasks.flatMap(task => [task.startDate, task.endDate]);
//     const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
//     const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
//     return {
//       start: new Date(minDate.getFullYear(), minDate.getMonth(), 1),
//       end: new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0)
//     };
//   }, [timelineTasks]);

//   // Generate timeline headers
//   const timelineHeaders = useMemo(() => {
//     const headers = [];
//     const current = new Date(dateRange.start);
    
//     while (current <= dateRange.end) {
//       headers.push(new Date(current));
      
//       if (viewMode === 'month') {
//         current.setMonth(current.getMonth() + 1);
//       } else if (viewMode === 'week') {
//         current.setDate(current.getDate() + 7);
//       } else {
//         current.setDate(current.getDate() + 1);
//       }
//     }
    
//     return headers;
//   }, [dateRange, viewMode]);

//   // Get unique universities
//   const universities = Array.from(new Set(tasks.map((task: Task) => task.university_name).filter(Boolean)));

//   // Calculate task position and width
//   const getTaskPosition = (task: TimelineTask) => {
//     const timelineStart = dateRange.start.getTime();
//     const taskStart = task.startDate.getTime();
//     const timelineDuration = dateRange.end.getTime() - timelineStart;
//     const taskDuration = task.endDate.getTime() - task.startDate.getTime();
    
//     const position = ((taskStart - timelineStart) / timelineDuration) * 100;
//     const width = (taskDuration / timelineDuration) * 100;
    
//     return { position: Math.max(0, position), width: Math.max(1, width) };
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gray-50 py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="animate-pulse">
//             <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
//             <div className="bg-gray-200 rounded-lg h-96"></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold text-gray-900 mb-2">Timeline View</h1>
//           <p className="text-gray-600">Visualize your application timeline and task deadlines.</p>
//         </div>

//         {/* Controls */}
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex flex-wrap gap-4 items-center">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">University Filter</label>
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
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
//               <div className="flex rounded-md shadow-sm">
//                 {(['month', 'week', 'day'] as const).map(mode => (
//                   <button
//                     key={mode}
//                     onClick={() => setViewMode(mode)}
//                     className={`px-3 py-2 text-sm font-medium border ${
//                       viewMode === mode
//                         ? 'bg-blue-500 text-white border-blue-500'
//                         : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
//                     } ${mode === 'month' ? 'rounded-l-md' : mode === 'day' ? 'rounded-r-md' : ''}`}
//                   >
//                     {mode.charAt(0).toUpperCase() + mode.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Timeline */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//           {/* Header */}
//           <div className="border-b border-gray-200">
//             <div className="flex">
//               <div className="w-64 p-4 border-r border-gray-200 bg-gray-50">
//                 <h3 className="font-semibold text-gray-900">Tasks</h3>
//               </div>
//               <div className="flex-1 overflow-x-auto">
//                 <div className="flex min-w-max">
//                   {timelineHeaders.map((date, index) => (
//                     <div
//                       key={index}
//                       className="flex-1 min-w-[120px] p-4 border-r border-gray-200 text-center"
//                     >
//                       <div className="text-sm font-medium text-gray-900">
//                         {viewMode === 'month' && date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
//                         {viewMode === 'week' && `Week ${Math.ceil(date.getDate() / 7)}`}
//                         {viewMode === 'day' && date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Timeline Body */}
//           <div className="max-h-[600px] overflow-y-auto">
//             {timelineTasks.length === 0 ? (
//               <div className="p-8 text-center">
//                 <div className="text-gray-400 text-6xl mb-4">📅</div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks to display</h3>
//                 <p className="text-gray-600">
//                   {selectedUniversity !== 'All' 
//                     ? 'Try selecting a different university or "All Universities".'
//                     : 'Add universities to your list to start generating tasks.'}
//                 </p>
//               </div>
//             ) : (
//               <div className="relative">
//                 {/* Timeline Grid */}
//                 <div className="absolute inset-0">
//                   <div className="flex">
//                     <div className="w-64"></div>
//                     <div className="flex-1 flex">
//                       {timelineHeaders.map((_, index) => (
//                         <div
//                           key={index}
//                           className="flex-1 min-w-[120px] border-r border-gray-100 h-full"
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Tasks */}
//                 {timelineTasks.map((task, index) => {
//                   const { position, width } = getTaskPosition(task);
//                   return (
//                     <div
//                       key={task.id}
//                       className="flex items-center py-2 border-b border-gray-100 hover:bg-gray-50"
//                     >
//                       {/* Task Info */}
//                       <div className="w-64 p-4 border-r border-gray-200 bg-white">
//                         <div className="flex items-center gap-2">
//                           <div
//                             className="w-3 h-3 rounded-full"
//                             style={{ backgroundColor: task.color }}
//                           />
//                           <div className="flex-1 min-w-0">
//                             <h4 className="text-sm font-medium text-gray-900 truncate">
//                               {task.title}
//                             </h4>
//                             <p className="text-xs text-gray-500 truncate">
//                               {task.university_name} • {task.phase}
//                             </p>
//                           </div>
//                         </div>
//                       </div>

//                       {/* Timeline Bar */}
//                       <div className="flex-1 relative h-8">
//                         <div
//                           className="absolute top-1 h-6 rounded-md shadow-sm flex items-center px-2 text-xs font-medium text-white"
//                           style={{
//                             left: `${position}%`,
//                             width: `${width}%`,
//                             backgroundColor: STATUS_COLORS[task.status],
//                             minWidth: '60px'
//                           }}
//                         >
//                           <span className="truncate">
//                             {task.status === 'Completed' ? '✓' : task.status === 'In Progress' ? '⏳' : '📋'}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Legend */}
//         <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Task Status</h4>
//               <div className="space-y-2">
//                 {Object.entries(STATUS_COLORS).map(([status, color]) => (
//                   <div key={status} className="flex items-center gap-2">
//                     <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
//                     <span className="text-sm text-gray-600">{status}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <h4 className="text-sm font-medium text-gray-700 mb-2">Task Phases</h4>
//               <div className="space-y-2">
//                 {Object.entries(PHASE_COLORS).map(([phase, color]) => (
//                   <div key={phase} className="flex items-center gap-2">
//                     <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
//                     <span className="text-sm text-gray-600">{phase}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
