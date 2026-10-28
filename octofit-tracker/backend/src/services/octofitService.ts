import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function withStatus(error: Error, status: number) {
  return Object.assign(error, { status });
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw withStatus(new Error('Activity payload is required'), 400);
  }

  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (!userId || !teamId || !type || minutes === undefined || minutes === null) {
    throw withStatus(new Error('userId, teamId, type, and minutes are required'), 400);
  }

  const userObjectId = String(userId);
  const teamObjectId = String(teamId);
  if (!mongoose.Types.ObjectId.isValid(userObjectId)) {
    throw withStatus(new Error('userId must be a valid ObjectId'), 400);
  }
  if (!mongoose.Types.ObjectId.isValid(teamObjectId)) {
    throw withStatus(new Error('teamId must be a valid ObjectId'), 400);
  }

  const user = await User.findById(userObjectId);
  const team = await Team.findById(teamObjectId);
  if (!user || !team) {
    throw withStatus(new Error('User or team not found'), 400);
  }

  const trimmedType = String(type).trim();
  const numericMinutes = Number(minutes);
  if (!trimmedType) {
    throw withStatus(new Error('type is required'), 400);
  }
  if (!Number.isFinite(numericMinutes) || numericMinutes <= 0) {
    throw withStatus(new Error('minutes must be a positive number'), 400);
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type: trimmedType,
    minutes: numericMinutes,
    points: numericMinutes,
    occurredAt: new Date(),
  });

  return activity.toObject ? activity.toObject() : activity;
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw withStatus(new Error('Team payload is required'), 400);
  }

  const { name, mascot, members } = input as Record<string, unknown>;
  if (typeof name !== 'string' || !name.trim()) {
    throw withStatus(new Error('Team name is required'), 400);
  }
  if (typeof mascot !== 'string' || !mascot.trim()) {
    throw withStatus(new Error('Team mascot is required'), 400);
  }

  const memberIds = Array.isArray(members) ? members : [];
  for (const memberId of memberIds) {
    if (typeof memberId !== 'string' || !mongoose.Types.ObjectId.isValid(memberId)) {
      throw withStatus(new Error('Team members must be valid ObjectIds'), 400);
    }
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: memberIds,
  });

  return team.toObject ? team.toObject() : team;
}

export async function getLeaderboard() {
  const teams = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  const teamIds = teams.map((entry) => entry._id);
  const teamRecords = await Team.find({ _id: { $in: teamIds } }).lean();
  const byId = new Map(teamRecords.map((team) => [String(team._id), team]));

  return teams.map((entry, index) => ({
    teamName: byId.get(String(entry._id))?.name ?? 'Unknown team',
    totalPoints: Number(entry.totalPoints) || 0,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  if (!userEmail) {
    throw withStatus(new Error('User email is required'), 404);
  }

  const user = await User.findOne({ email: userEmail.toLowerCase() }).lean();
  if (!user) {
    throw withStatus(new Error('User not found'), 404);
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const frequencyByFocus = new Map<string, number>();

  for (const activity of recentActivities) {
    const label = String(activity.type ?? '').toLowerCase();
    if (/run|cycle|swim|hike|cardio|endurance/.test(label)) {
      frequencyByFocus.set('endurance', (frequencyByFocus.get('endurance') ?? 0) + 1);
    }
    if (/strength|lift|push|pull|power/.test(label)) {
      frequencyByFocus.set('strength', (frequencyByFocus.get('strength') ?? 0) + 1);
    }
    if (/mobility|stretch|yoga|balance/.test(label)) {
      frequencyByFocus.set('mobility', (frequencyByFocus.get('mobility') ?? 0) + 1);
    }
  }

  const goal = String(user.fitnessGoal ?? '').toLowerCase();
  const preferredFocus =
    frequencyByFocus.get('strength') && !frequencyByFocus.get('endurance') && !frequencyByFocus.get('mobility')
      ? 'strength'
      : frequencyByFocus.get('endurance') && !frequencyByFocus.get('strength') && !frequencyByFocus.get('mobility')
        ? 'endurance'
        : /strength/.test(goal)
          ? 'strength'
          : /mobility|recovery|stretch/.test(goal)
            ? 'mobility'
            : 'endurance';

  const candidateWorkouts = await Workout.find({ focus: preferredFocus }).lean();
  const fallbackWorkouts = await Workout.find().lean();
  const suggestions = (candidateWorkouts.length ? candidateWorkouts : fallbackWorkouts).slice(0, 3).map((workout) => ({
    ...workout,
    reason: `Based on your recent ${recentActivities[0]?.type ?? preferredFocus} activity and ${preferredFocus} goal, this workout fits your pattern.`,
  }));

  return suggestions;
}

export { User };
