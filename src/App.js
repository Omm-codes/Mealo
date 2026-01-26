import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import Home from './pages/Home/Home';
import Search from './pages/Search/Search';
import Explore from './pages/Explore/Explore';
import MealDetail from './pages/MealDetail/MealDetail';
import Categories from './pages/Categories/Categories';
import CategoryMeals from './pages/CategoryMeals/CategoryMeals';
import Favorites from './pages/Favorites/Favorites';
import AiRecipeGenerator from './pages/AiRecipeGenerator/AiRecipeGenerator';
import NutritionAnalysis from './pages/NutritionAnalysis/NutritionAnalysis';
import MealPlanner from './pages/MealPlanner/MealPlanner';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';
import PageNotFound from './pages/PageNotFound/PageNotFound';
import { Analytics } from "@vercel/analytics/react"


function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Header />
          <main className="App-main">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/meal/:id" element={<MealDetail />} />
              <Route path="/nutrition/:id" element={<NutritionAnalysis />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/category/:name" element={<CategoryMeals />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/ai-recipe-generator" element={<AiRecipeGenerator />} />
              <Route path="/meal-planner" element={<MealPlanner />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Analytics />
      </Router>
    </AuthProvider>
  );
}

export default App;
