import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormField from '../components/FormField';
import Loader from '../components/Loader';
import { getRandomPrompt } from '../utils';
import preview from '../assets/preview.png';

const CreatePost = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ prompt: '', photo: '' });
  const [generatingImg, setGeneratingImg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get('http://localhost:8080/api/v1/auth/profile', config);
        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSurpriseMe = () => {
    const randomPrompt = getRandomPrompt(form.prompt);
    setForm({ ...form, prompt: randomPrompt });
  };

  const generateImage = async () => {
    if (!form.prompt) {
      alert('Please enter a prompt');
      return;
    }

    try {
      setGeneratingImg(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post('http://localhost:8080/api/v1/dalle', { prompt: form.prompt }, config);
      setForm({ ...form, photo: response.data.photo });
      setGeneratingImg(false);
    } catch (error) {
      setGeneratingImg(false);
      if (error.response && error.response.data && error.response.data.message) {
        const errorMessage = error.response.data.message;
        if (errorMessage === 'Billing limit reached. Please upgrade your plan.') {
          alert('Billing limit reached. Please upgrade your plan.');
        } else {
          alert(`Error: ${errorMessage}`);
        }
      } else {
        console.error('Error generating image:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.prompt && form.photo && user) {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.post('http://localhost:8080/api/v1/post', {
          username: user.username,
          prompt: form.prompt,
          photo: form.photo,
        }, config);

        if (response.status === 201) {
          navigate('/');
        } else {
          alert('Error creating post');
        }
      } catch (error) {
        console.error('Error creating post:', error);
        alert(`Error creating post: ${error.response ? error.response.data : error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please fill out all fields');
    }
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Create</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">
          Create imaginative images with DALL-E AI and share them with the community.
        </p>
      </div>

      <form className="mt-16 max-w-3xl" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5">
          <FormField
            labelName="Prompt"
            type="text"
            name="prompt"
            placeholder="Enter a prompt..."
            value={form.prompt}
            handleChange={handleChange}
            isSurpriseMe
            handleSurpriseMe={handleSurpriseMe}
          />

          <div className="relative bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-64 p-3 h-64 flex justify-center items-center">
            {form.photo ? (
              <img src={form.photo} alt={form.prompt} className="w-full h-full object-contain" />
            ) : (
              <img src={preview} alt="preview" className="w-9/12 h-9/12 object-contain opacity-40" />
            )}

            {generatingImg && (
              <div className="absolute inset-0 z-0 flex justify-center items-center bg-[rgba(0,0,0,0.5)] rounded-lg">
                <Loader />
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex gap-5">
          <button
            type="button"
            onClick={generateImage}
            className="text-white bg-green-700 font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {generatingImg ? 'Generating...' : 'Generate'}
          </button>
        </div>

        <div className="mt-10">
          <p className="mt-2 text-[#666e75] text-[14px]">** After generating, you can share this image with others **</p>
          <button
            type="submit"
            className="mt-3 text-white bg-[#6469ff] font-medium rounded-md text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? 'Sharing...' : 'Share with the community'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;
