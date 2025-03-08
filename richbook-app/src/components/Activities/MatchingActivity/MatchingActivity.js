// src/components/Activities/MatchingActivity/MatchingActivity.js
import React, { useState, useEffect } from 'react';
import ActivityDataService from '../../../services/ActivityDataService';

function MatchingActivity({ activityId }) {
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await ActivityDataService.getActivityData('matching', activityId);
        setActivityData(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activityId]);

  if (loading) {
    return <p>Loading activity data...</p>;
  }

  if (error) {
    return <p>Error loading activity: {error.message}</p>;
  }

  if (!activityData) {
    return <p>No activity data found.</p>;
  }

  // ... render the Matching Activity UI using activityData ...
  return (
    <div>
      <h3>Matching Activity: {activityData.title}</h3>
      {/* ... render matching pairs, etc. based on activityData ... */}
    </div>
  );
}

export default MatchingActivity;