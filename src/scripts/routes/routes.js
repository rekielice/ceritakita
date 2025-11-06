import HomePage from '../pages/home/home-page.js';
import LoginPage from '../pages/login/login-page.js';       
import RegisterPage from '../pages/register/register-page.js'; 
import MapPage from '../pages/map/map-page.js'; 
import AddStoryPage from '../pages/add-story/add-story-page.js'; 
import StoryDetailPage from '../pages/detail/story-detail-page.js'; 
import FavoritePage from '../pages/favorite/favorite-page.js';
import AboutPage from '../pages/about/about-page.js'; 

const routes = {  
  '/': new HomePage(),
  '/login': new LoginPage(),     
  '/register': new RegisterPage(), 
  '/map': new MapPage(), 
  '/add-story': new AddStoryPage(), 
  '/story/:id': new StoryDetailPage(), 
  '/favorite': new FavoritePage(),
  '/about': new AboutPage(),
};

export default routes;