export function compactTrajectory(trajectory) {
  if (!Array.isArray(trajectory) || trajectory.length === 0) return [];
  
  let prevTime = trajectory[0].timestamp || Date.now();
  return trajectory.map(t => {
    const timestamp = t.timestamp || Date.now();
    const delta = timestamp - prevTime;
    prevTime = timestamp;
    
    // Strip redundant boilerplate
    const { callerId, raw_schema, iso8601, ...rest } = t;
    
    return { 
      ...rest, 
      tsDelta: `+${delta}ms` 
    };
  });
}
