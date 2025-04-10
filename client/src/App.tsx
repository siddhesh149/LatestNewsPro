import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import CategoryPage from "@/pages/category-page";
import ArticlePage from "@/pages/article-page";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/admin/dashboard";
import Articles from "@/pages/admin/articles";
import Categories from "@/pages/admin/categories";
import EditArticle from "@/pages/admin/edit-article";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "./hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/article/:slug" component={ArticlePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes - Protected */}
      <ProtectedRoute path="/admin" component={Dashboard} />
      <ProtectedRoute path="/admin/articles" component={Articles} />
      <ProtectedRoute path="/admin/categories" component={Categories} />
      <ProtectedRoute path="/admin/articles/new" component={EditArticle} />
      <ProtectedRoute path="/admin/articles/edit/:id" component={EditArticle} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
