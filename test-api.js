
import fetch from 'node-fetch';

async function testAPI() {
  console.log("Testing API endpoints...");
  
  try {
    // Test health check endpoint
    console.log("\n🔍 Testing health check endpoint...");
    const healthCheck = await fetch('http://localhost:5000/api/health-check');
    
    if (healthCheck.ok) {
      const healthData = await healthCheck.json();
      console.log("✅ Health check successful!");
      console.log("API Status:", healthData.status);
      console.log("Database:", healthData.database);
      console.log("Environment:", healthData.environment);
    } else {
      console.log("❌ Health check failed with status:", healthCheck.status);
    }

    // Test services endpoint
    console.log("\n🔍 Testing services endpoint...");
    const services = await fetch('http://localhost:5000/api/services');
    
    if (services.ok) {
      const servicesData = await services.json();
      console.log("✅ Services endpoint successful!");
      console.log(`Found ${servicesData.length} services`);
      
      if (servicesData.length > 0) {
        console.log("Sample service:", {
          id: servicesData[0].id,
          name: servicesData[0].name,
          price: servicesData[0].price
        });
      }
    } else {
      console.log("❌ Services endpoint failed with status:", services.status);
    }
    
    // Test rooms endpoint
    console.log("\n🔍 Testing rooms endpoint...");
    const rooms = await fetch('http://localhost:5000/api/rooms');
    
    if (rooms.ok) {
      const roomsData = await rooms.json();
      console.log("✅ Rooms endpoint successful!");
      console.log(`Found ${roomsData.length} rooms`);
    } else {
      console.log("❌ Rooms endpoint failed with status:", rooms.status);
    }
    
    // Test stats endpoint
    console.log("\n🔍 Testing stats endpoint...");
    const stats = await fetch('http://localhost:5000/api/stats');
    
    if (stats.ok) {
      const statsData = await stats.json();
      console.log("✅ Stats endpoint successful!");
      console.log("Dashboard stats retrieved successfully");
    } else {
      console.log("❌ Stats endpoint failed with status:", stats.status);
    }
    
    console.log("\n✅ API testing completed");
    
  } catch (error) {
    console.error("❌ API testing error:", error.message);
    
    // Check if server is running
    console.log("\nChecking if API server is running...");
    try {
      await fetch('http://localhost:5000');
      console.log("API server is running, but endpoints have errors");
    } catch (serverError) {
      console.log("API server not running");
    }
  }
}

testAPI();
