import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Favorites
export const addFavorite = async (userId, meal) => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', meal.idMeal);
    await setDoc(favoriteRef, {
      ...meal,
      addedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding favorite:', error);
    return { success: false, error };
  }
};

export const removeFavorite = async (userId, mealId) => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', mealId);
    await deleteDoc(favoriteRef);
    return { success: true };
  } catch (error) {
    console.error('Error removing favorite:', error);
    return { success: false, error };
  }
};

export const getFavorites = async (userId) => {
  try {
    const favoritesRef = collection(db, 'users', userId, 'favorites');
    const q = query(favoritesRef, orderBy('addedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const favorites = [];
    querySnapshot.forEach((doc) => {
      favorites.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: favorites };
  } catch (error) {
    console.error('Error getting favorites:', error);
    return { success: false, error };
  }
};

export const isFavorite = async (userId, mealId) => {
  try {
    const favoriteRef = doc(db, 'users', userId, 'favorites', mealId);
    const docSnap = await getDoc(favoriteRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking favorite:', error);
    return false;
  }
};

// Meal Planner
export const saveMealPlan = async (userId, date, mealType, meal) => {
  try {
    const planId = `${date}_${mealType}`;
    const planRef = doc(db, 'users', userId, 'mealPlans', planId);
    await setDoc(planRef, {
      date,
      mealType,
      meal,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error saving meal plan:', error);
    return { success: false, error };
  }
};

export const getMealPlans = async (userId, startDate, endDate) => {
  try {
    const plansRef = collection(db, 'users', userId, 'mealPlans');
    const q = query(
      plansRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    const plans = [];
    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, data: plans };
  } catch (error) {
    console.error('Error getting meal plans:', error);
    return { success: false, error };
  }
};

export const deleteMealPlan = async (userId, planId) => {
  try {
    const planRef = doc(db, 'users', userId, 'mealPlans', planId);
    await deleteDoc(planRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting meal plan:', error);
    return { success: false, error };
  }
};

// User Profile
export const createUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User profile not found' };
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return { success: false, error };
  }
};

export const updateUserProfile = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return { success: false, error };
  }
};
