/**
 * University Matching Algorithm
 * Uses Weighted Sum Model + Softmax for university recommendations
 * Based on student assessment data and university profiles
 */

// Utility function to clamp values between min and max
function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

// Softmax function to convert scores to probabilities
function softmax(scores, temperature = 0.1) {
  const exps = scores.map(s => Math.exp(s / temperature));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

// Compute similarity metrics for each criterion
function computeSimilarityMetrics(student, university, options = {}) {
  const {
    maxRank = 200,
    maxGmat = 800,
    maxGpa = 4.0,
    maxTuition = 100000,
    maxWorkYears = 10
  } = options;

  // GMAT similarity (closer scores = higher similarity)
  const gmatSim = university.avg_gmat_score 
    ? clamp(1 - Math.abs(student.gmat_score - university.avg_gmat_score) / maxGmat)
    : 0.5; // Default if no data

  // GPA similarity
  const gpaSim = university.avg_gpa 
    ? clamp(1 - Math.abs(student.gpa - university.avg_gpa) / maxGpa)
    : 0.5;

  // Work experience match
  const workMatch = university.avg_work_experience_years 
    ? clamp(student.work_experience_years / university.avg_work_experience_years)
    : 0.5;

  // Program and field match
  let programMatch = 0.2; // Base score
  if (student.program_type === university.program_type) {
    if (student.field_of_interest === university.field_of_study) {
      programMatch = 1.0; // Perfect match
    } else {
      programMatch = 0.6; // Program type matches, field doesn't
    }
  } else if (student.field_of_interest === university.field_of_study) {
    programMatch = 0.4; // Field matches, program type doesn't
  }

  // Rank score (lower rank number = higher score)
  const rankScore = university.world_ranking 
    ? clamp((maxRank - university.world_ranking) / (maxRank - 1))
    : 0.5;

  // Acceptance score (higher acceptance rate = easier to get in)
  const acceptanceScore = university.acceptance_rate || 0.1;

  // Cost fit (within budget = higher score)
  const costScore = student.max_budget && university.annual_tuition_usd
    ? clamp(1 - Math.max(0, (university.annual_tuition_usd - student.max_budget) / maxTuition))
    : 0.5;

  // Scholarship fit
  const scholarshipScore = university.scholarship_rate || 0.1;

  // Location match
  let locationScore = 0.1; // Default
  if (student.preferred_locations && student.preferred_locations.length > 0) {
    if (student.preferred_locations.includes(university.country)) {
      locationScore = 1.0;
    } else {
      // Check for region matches (simplified)
      const regions = {
        'USA': ['United States', 'USA'],
        'UK': ['United Kingdom', 'UK'],
        'Canada': ['Canada'],
        'Australia': ['Australia'],
        'Europe': ['Germany', 'France', 'Netherlands', 'Switzerland', 'Sweden']
      };
      
      let regionMatch = false;
      for (const [region, countries] of Object.entries(regions)) {
        if (student.preferred_locations.includes(region) && countries.includes(university.country)) {
          regionMatch = true;
          break;
        }
      }
      locationScore = regionMatch ? 0.7 : 0.3;
    }
  }

  // Deadline urgency (more time = higher score)
  let deadlineScore = 0.5;
  if (university.application_deadline) {
    const today = new Date();
    const deadline = new Date(university.application_deadline);
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) {
      deadlineScore = 0; // Deadline passed
    } else if (daysLeft < 7) {
      deadlineScore = 0.2; // Very urgent
    } else if (daysLeft < 30) {
      deadlineScore = 0.5; // Moderate urgency
    } else {
      deadlineScore = 1.0; // Plenty of time
    }
  }

  return {
    gmat: gmatSim,
    gpa: gpaSim,
    program: programMatch,
    work: workMatch,
    rank: rankScore,
    acceptance: acceptanceScore,
    cost: costScore,
    scholarship: scholarshipScore,
    location: locationScore,
    deadline: deadlineScore
  };
}

// Apply weights to compute final score
function computeWeightedScore(metrics, weights) {
  let totalScore = 0;
  let totalWeight = 0;

  for (const [criterion, score] of Object.entries(metrics)) {
    const weight = weights[`weight_${criterion}`] || 0;
    totalScore += score * weight;
    totalWeight += weight;
  }

  // Normalize by total weight to ensure score is between 0-1
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

// Main matching function
export function findBestMatches(student, universities, options = {}) {
  const {
    topN = 5,
    temperature = 0.1,
    includeBreakdown = true
  } = options;

  // Default weights if not provided
  const defaultWeights = {
    weight_gmat: 0.25,
    weight_gpa: 0.20,
    weight_program: 0.15,
    weight_work: 0.10,
    weight_rank: 0.10,
    weight_acceptance: 0.05,
    weight_cost: 0.05,
    weight_scholarship: 0.05,
    weight_location: 0.05,
    weight_deadline: 0.05
  };

  const weights = { ...defaultWeights, ...student };

  // Compute scores for all universities
  const universityScores = universities.map(uni => {
    const metrics = computeSimilarityMetrics(student, uni, options);
    const score = computeWeightedScore(metrics, weights);
    
    return {
      university: uni,
      score,
      metrics: includeBreakdown ? metrics : undefined
    };
  });

  // Sort by score (descending)
  universityScores.sort((a, b) => b.score - a.score);

  // Take top N
  const topMatches = universityScores.slice(0, topN);

  // Apply softmax to get probabilities
  const rawScores = topMatches.map(match => match.score);
  const probabilities = softmax(rawScores, temperature);

  // Format results
  const results = topMatches.map((match, index) => ({
    id: match.university.id,
    name: match.university.name,
    country: match.university.country,
    world_ranking: match.university.world_ranking,
    program_type: match.university.program_type,
    field_of_study: match.university.field_of_study,
    score: Math.round(match.score * 10000) / 100, // Convert to percentage
    probability: Math.round(probabilities[index] * 10000) / 100,
    rank_position: index + 1,
    breakdown: match.metrics ? {
      gmat: Math.round(match.metrics.gmat * 100),
      gpa: Math.round(match.metrics.gpa * 100),
      program: Math.round(match.metrics.program * 100),
      work: Math.round(match.metrics.work * 100),
      rank: Math.round(match.metrics.rank * 100),
      acceptance: Math.round(match.metrics.acceptance * 100),
      cost: Math.round(match.metrics.cost * 100),
      scholarship: Math.round(match.metrics.scholarship * 100),
      location: Math.round(match.metrics.location * 100),
      deadline: Math.round(match.metrics.deadline * 100)
    } : undefined
  }));

  return {
    top_universities: results,
    algorithm_version: '1.0',
    total_universities_evaluated: universities.length,
    weights_used: weights
  };
}

// Generate explanation for why a university was recommended
export function generateExplanation(university, breakdown, weights) {
  const explanations = [];
  
  // Find top 3 contributing factors
  const factors = Object.entries(breakdown)
    .map(([key, value]) => ({ key, value, weight: weights[`weight_${key}`] || 0 }))
    .sort((a, b) => (b.value * b.weight) - (a.value * a.weight))
    .slice(0, 3);

  factors.forEach((factor, index) => {
    const contribution = Math.round(factor.value * factor.weight * 100);
    let explanation = '';
    
    switch (factor.key) {
      case 'gmat':
        explanation = `GMAT score alignment (${contribution}% contribution)`;
        break;
      case 'gpa':
        explanation = `GPA compatibility (${contribution}% contribution)`;
        break;
      case 'program':
        explanation = `Program and field match (${contribution}% contribution)`;
        break;
      case 'work':
        explanation = `Work experience fit (${contribution}% contribution)`;
        break;
      case 'rank':
        explanation = `University ranking preference (${contribution}% contribution)`;
        break;
      case 'cost':
        explanation = `Budget compatibility (${contribution}% contribution)`;
        break;
      case 'location':
        explanation = `Location preference (${contribution}% contribution)`;
        break;
      default:
        explanation = `${factor.key} match (${contribution}% contribution)`;
    }
    
    explanations.push(explanation);
  });

  return explanations;
}

export default {
  findBestMatches,
  generateExplanation,
  computeSimilarityMetrics,
  computeWeightedScore
};
