const GetFrontendCode = async (req, res) => {
    let appCode = 
`import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', completed: false },
    { id: 2, text: 'Build awesome apps', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ]);
  const [inputValue, setInputValue] = useState('');

  const addTodo = () => {
    if (inputValue.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false
      }]);
      setInputValue('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto p-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
            Todo App
          </h1>
          <p className="text-gray-300 text-lg">Organize your tasks with style</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-gray-400 text-sm">Total Tasks</p>
            <p className="text-2xl font-bold text-white">{todos.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-gray-400 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-400">
              {todos.filter(t => t.completed).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {todos.filter(t => !t.completed).length}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            {/* Counter Section */}
            <div className="mb-8 p-6 bg-white/5 rounded-xl">
              <h2 className="text-2xl font-semibold text-white mb-4">Quick Counter</h2>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCount(count - 1)}
                  className="w-12 h-12 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all hover:scale-110 font-bold text-xl shadow-lg"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-white min-w-[100px] text-center">
                  {count}
                </span>
                <button
                  onClick={() => setCount(count + 1)}
                  className="w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all hover:scale-110 font-bold text-xl shadow-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add Todo */}
            <div className="mb-6">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a new task..."
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all"
                />
                <button
                  onClick={addTodo}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Add Task
                </button>
              </div>
            </div>

            {/* Todo List */}
            <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
              {todos.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No tasks yet. Add one above!</p>
              ) : (
                todos.map(todo => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 accent-purple-500"
                    />
                    <span className={\`flex-1 text-white \${todo.completed ? 'line-through opacity-50' : ''}\`}>
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p>Built with React & Tailwind CSS</p>
        </div>
      </div>

      <style jsx>{\`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      \`}</style>
    </div>
  );
}`;
    res.json({ code: appCode });
}

module.exports = {
  GetFrontendCode
};
