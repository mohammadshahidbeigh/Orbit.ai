import { useQuery } from '@tanstack/react-query';
import { universitiesAPI, userUniversitiesAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Search, Plus, GraduationCap, Sparkles, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Assessment } from './Assessment';
import { toast } from 'react-toastify';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ManageSchools() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce the search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Track if user is currently typing
  useEffect(() => {
    setIsTyping(searchQuery !== debouncedSearchQuery);
  }, [searchQuery, debouncedSearchQuery]);

  // Fetch all universities with debounced search
  const { data: universities, isLoading: isLoadingUniversities } = useQuery({
    queryKey: ['universities', debouncedSearchQuery],
    queryFn: async () => {
      const response = await universitiesAPI.getAll({ search: debouncedSearchQuery });
      return response.data;
    },
    staleTime: 30000, // Cache results for 30 seconds
  });

  // Fetch user's selected universities
  const { data: userUniversities, isLoading: isLoadingUserUniversities } = useQuery({
    queryKey: ['user-universities'],
    queryFn: async () => {
      const response = await userUniversitiesAPI.getAll();
      return response.data;
    },
  });

  const filteredUniversities = universities?.filter(() => {
    if (selectedProgram === 'All') return true;
    return true; // Will add filtering logic later
  });

  const selectedUniversityIds = new Set(userUniversities?.map((u: any) => u.university_id) || []);

  if (isLoadingUniversities || isLoadingUserUniversities) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const handleAddToList = (university: any) => {
    setSelectedUniversity(university);
    setShowAssessment(true);
  };

  const generateRandomDeadline = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate realistic application deadlines
    // Most deadlines are in late fall/early winter for next year's admission
    const deadlines = [
      // Fall 2025 deadlines (current year + 1)
      `${currentYear + 1}-10-15`, // October 15
      `${currentYear + 1}-11-01`, // November 1
      `${currentYear + 1}-11-15`, // November 15
      `${currentYear + 1}-11-27`, // November 27 (like your example)
      `${currentYear + 1}-12-01`, // December 1
      `${currentYear + 1}-12-06`, // December 6 (like your example)
      `${currentYear + 1}-12-15`, // December 15
      `${currentYear + 1}-12-31`, // December 31
      
      // Fall 2026 deadlines (current year + 2)
      `${currentYear + 2}-01-05`, // January 5
      `${currentYear + 2}-01-15`, // January 15
      `${currentYear + 2}-01-25`, // January 25
      `${currentYear + 2}-02-01`, // February 1
      `${currentYear + 2}-02-15`, // February 15
      `${currentYear + 2}-03-01`, // March 1
      `${currentYear + 2}-03-15`, // March 15
      `${currentYear + 2}-04-01`, // April 1
    ];
    
    // Randomly select one of the realistic deadlines
    const randomIndex = Math.floor(Math.random() * deadlines.length);
    return deadlines[randomIndex];
  };

  const handleAssessmentComplete = async (assessmentData: any) => {
    try {
      // Add university to user's list with assessment data
      await userUniversitiesAPI.add({
        university_id: selectedUniversity.id,
        program_type: assessmentData.program_type,
        application_deadline: generateRandomDeadline(),
        assessment_data: assessmentData
      });
      
      // Show success toast
      toast.success(`${selectedUniversity.name} added to your list!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      
      // Reset state
      setShowAssessment(false);
      setSelectedUniversity(null);
      
      // Refresh the user universities query
      window.location.reload(); // Simple refresh for now
    } catch (error: any) {
      console.error('Error adding university:', error);
      toast.error(error.response?.data?.message || 'Failed to add university', {
        position: 'top-right',
        autoClose: 4000,
      });
    }
  };

  // Show assessment if requested
  if (showAssessment) {
    return (
      <Assessment 
        onClose={() => {
          setShowAssessment(false);
          setSelectedUniversity(null);
        }}
        selectedUniversity={selectedUniversity}
        onComplete={handleAssessmentComplete}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Schools</h1>
          <p className="text-muted-foreground">Search and add universities to track</p>
        </div>
        <Button 
          onClick={() => setShowAssessment(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Find Your Best Fit
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Search Universities</CardTitle>
          <CardDescription>Find your target schools</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by university name..."
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {(isTyping || isLoadingUniversities) && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-5 w-5 animate-spin" />
              )}
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
            >
              <option value="All">All Programs</option>
              <option value="Undergrad">Undergraduate</option>
              <option value="MBA">MBA</option>
              <option value="Graduate">Graduate</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Selected Universities */}
      {userUniversities && userUniversities.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Selected Universities ({userUniversities.length})</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {userUniversities.map((uni: any) => (
              <Card key={uni.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{uni.university_name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{uni.world_ranking}
                        </span>
                        <span className="text-xs">{uni.country}</span>
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">×</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">{new Date(uni.application_deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program:</span>
                      <span className="font-medium">{uni.program_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className={`font-medium ${
                        uni.status === 'Active' ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {uni.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Universities */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Available Universities
          {(isTyping || isLoadingUniversities) && searchQuery && (
            <span className="ml-2 text-sm text-gray-500 font-normal">
              Searching...
            </span>
          )}
        </h2>
        {filteredUniversities && filteredUniversities.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((uni: any) => {
              const isSelected = selectedUniversityIds.has(uni.id);
              return (
                <Card key={uni.id} className={isSelected ? 'opacity-60 bg-gray-50' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GraduationCap className="h-5 w-5 text-primary" />
                          {uni.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded font-semibold">
                            Rank #{uni.world_ranking || 'N/A'}
                          </span>
                          <span className="text-xs">{uni.country}</span>
                        </CardDescription>
                      </div>
                      {isSelected && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Added</span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">
                      {uni.website && (
                        <a href={uni.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          Visit Website →
                        </a>
                      )}
                    </p>
                    {!isSelected && (
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleAddToList(uni)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add to List
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-muted-foreground">No universities found</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your search</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

