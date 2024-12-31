export const extractDocument = async (systemPrompt: string, userPrompt: string, image: File, parameters: any) => {
    const formData = new FormData();
    formData.append('system_prompt', systemPrompt);
    formData.append('user_prompt', userPrompt);
    formData.append('image', image);
    formData.append('max_tokens', String(parameters.maxTokens));
    formData.append('temperature', String(parameters.temperature));
    formData.append('top_p', String(parameters.topP));
  
    const response = await fetch('http://localhost:5000/extract', {
      method: 'POST',
      body: formData,
    });
  
    return response.json();
  };