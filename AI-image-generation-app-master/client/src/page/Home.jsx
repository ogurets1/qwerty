import React, { useEffect, useState, useRef } from 'react';
import { Card, FormField, Loader } from '../components';

const RenderCards = ({ data, title }) => {
  if (data && data.length > 0) {
    return data.map((post) => <Card key={post._id} {...post} />);
  }

  return (
    <h2 className="mt-5 font-bold text-[#6469ff] text-xl uppercase">{title}</h2>
  );
};

const Home = () => {
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchedResults, setSearchedResults] = useState([]);
  const searchTimeoutRef = useRef(null);

  const fetchPosts = async () => {
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/v1/post', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setAllPosts(result.data.reverse());
      }
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearchChange = (e) => {
    const { value } = e.target;
    setSearchText(value);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      if (value) {
        const searchResult = allPosts.filter((item) =>
          item.username.toLowerCase().includes(value.toLowerCase()) ||
          item.prompt.toLowerCase().includes(value.toLowerCase())
        );
        setSearchedResults(searchResult);
      } else {
        setSearchedResults([]);
      }
    }, 500);
  };

  return (
    <section className="max-w-7xl mx-auto">
      <div>
        <h1 className="font-extrabold text-[#222328] text-[32px]">Галерея сообщества</h1>
        <p className="mt-2 text-[#666e75] text-[14px] max-w-[500px]">Просмотрите коллекцию креативных и визуально впечатляющих изображений, сгенерированных искусственным интеллектом DALL-E</p>
      </div>

      <div className="mt-16">
        <FormField
          labelName="Поиск постов"
          type="text"
          name="text"
          placeholder="Поиск..."
          value={searchText}
          handleChange={handleSearchChange}
        />
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {searchText && (
              <h2 className="font-medium text-[#666e75] text-xl mb-3">
                Показаны результаты для <span className="text-[#222328]">{searchText}</span>:
              </h2>
            )}
            <div className="grid lg:grid-cols-4 sm:grid-cols-3 xs:grid-cols-2 grid-cols-1 gap-3">
              {searchText ? (
                <RenderCards
                  data={searchedResults}
                  title="По вашему запросу ничего не найдено"
                />
              ) : (
                <RenderCards
                  data={allPosts}
                  title="Пока нет постов"
                />
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Home;
