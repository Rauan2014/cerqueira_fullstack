"use client";

import React, { useState, useEffect } from "react";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import InstagramPost from "../InstagramPost/InstagramPost.jsx";
import styles from "./BlogPage.module.css";

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("Fetching Instagram posts...");

        const response = await fetch("/api/instagram");
        
        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          console.error("API Response Error:", {
            status: response.status,
            statusText: response.statusText,
          });
          throw new Error(
            `Falha ao carregar os posts do Instagram (${response.status})`
          );
        }

        const data = await response.json();
        console.log("API Response received:", data);

        // Check if we got an error in the response
        if (data.error) {
          console.error("API returned error:", data.error);
          console.error("Debug info:", data.debug);
          throw new Error(data.error);
        }

        // Handle the correct data structure
        if (data.posts && Array.isArray(data.posts)) {
          console.log(`Successfully loaded ${data.posts.length} posts`);
          
          // Process posts to ensure caption/text is available
          const processedPosts = data.posts.map(post => ({
            ...post,
            // Handle Portuguese field names from your API
            caption: post.legenda || post.caption || '',
            text: post.legenda || post.caption || post.text || '',
            title: post.titulo || '',
            // Ensure we have a proper timestamp (your API uses 'data' field)
            timestamp: post.data || post.timestamp || new Date().toISOString()
          }));
          
          setPosts(processedPosts);
          setProfile(data.profile);
          setDebugInfo(data.debug);
        } else if (Array.isArray(data)) {
          // Fallback: if API returns array directly
          console.log(`Loaded ${data.length} posts (direct array)`);
          
          const processedPosts = data.map(post => ({
            ...post,
            // Handle Portuguese field names from your API
            caption: post.legenda || post.caption || '',
            text: post.legenda || post.caption || post.text || '',
            title: post.titulo || '',
            timestamp: post.data || post.timestamp || new Date().toISOString()
          }));
          
          setPosts(processedPosts);
        } else {
          console.error("Unexpected data structure:", data);
          console.error("Expected: { posts: [...], profile: {...} }");
          console.error("Received:", typeof data, data);
          throw new Error("Estrutura de dados inesperada da API");
        }

        setError(null);
        
      } catch (err) {
        console.error("Error fetching posts:", err);
        console.error("Error stack:", err.stack);
        
        // Set a user-friendly error message
        let errorMessage = "Não foi possível carregar as publicações. ";
        
        if (err.message.includes("500")) {
          errorMessage += "Erro interno do servidor. Verifique a configuração do token do Instagram.";
        } else if (err.message.includes("401")) {
          errorMessage += "Token de acesso inválido. Por favor, reconfigure o token do Instagram.";
        } else if (err.message.includes("404")) {
          errorMessage += "Endpoint não encontrado. Verifique se a API está configurada corretamente.";
        } else if (err.message.includes("Network")) {
          errorMessage += "Erro de rede. Verifique sua conexão com a internet.";
        } else {
          errorMessage += "Por favor, tente novamente mais tarde.";
        }
        
        setError(errorMessage);
        setPosts([]);
        setProfile(null);
        setDebugInfo(null);
        
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Helper function to render debug info in development
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === 'development' && debugInfo) {
      return (
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px 0', 
          fontSize: '12px',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong>
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      );
    }
    return null;
  };

  // Helper function to render post data structure in development
  const renderPostDebugInfo = () => {
    if (process.env.NODE_ENV === 'development' && posts.length > 0) {
      return (
        <div style={{ 
          background: '#e6f3ff', 
          padding: '10px', 
          margin: '10px 0', 
          fontSize: '12px',
          borderRadius: '4px',
          fontFamily: 'monospace'
        }}>
          <strong>Sample Post Structure:</strong>
          <pre>{JSON.stringify(posts[0], null, 2)}</pre>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <Header />

      <main className={styles.main}>
        <h1 className={styles.pageTitle}>Blog</h1>
        <div className={styles.blogContent}>
          {loading ? (
            <div className={styles.loading}>
              Carregando publicações...
              <div style={{ fontSize: "12px", marginTop: "5px", opacity: 0.7 }}>
                Conectando com Instagram API...
              </div>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <strong>Erro:</strong> {error}
              <div
                style={{ fontSize: "12px", marginTop: "10px", opacity: 0.8 }}
              >
                Verifique o console do navegador para mais detalhes.
              </div>
              {renderDebugInfo()}
            </div>
          ) : posts.length > 0 ? (
            <>
              
              {posts.map((post, idx) => (
                <InstagramPost
                  key={post.id}
                  post={post}
                  index={idx}
                  totalPosts={posts.length}
                />
              ))}
              
              {renderDebugInfo()}
              {renderPostDebugInfo()}
            </>
          ) : (
            <div className={styles.noPosts}>
              <strong>Nenhuma publicação encontrada.</strong>
              <div
                style={{ fontSize: "14px", marginTop: "10px", opacity: 0.8 }}
              >
                {profile
                  ? `A conta @${profile.username} tem ${profile.mediaCount} posts, mas nenhum foi retornado pela API.`
                  : "Verifique se o token do Instagram está configurado corretamente."}
              </div>
              {renderDebugInfo()}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;