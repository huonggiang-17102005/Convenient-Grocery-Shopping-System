async function run() {
  const url = 'http://localhost:5000/api/ai/estimate-nutrition';
  
  const payload = {
    ingredients: [
      { name: 'Thịt bò', quantity: 100, unit: 'g' },
      { name: 'Hành tây', quantity: 1, unit: 'củ' }
    ],
    instructions: [
      'Thái thịt bò mỏng',
      'Xào hành tây với thịt bò'
    ]
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    console.log('Status Code:', res.status);
    const data = await res.json();
    console.log('Response body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error executing request:', err);
  }
}

run();
