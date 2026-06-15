import { Post } from './supabase';

export const MOCK_POSTS: Post[] = [
  {
    id: 'mock-1',
    user_id: 'mock-user',
    title: 'Authentication Hook in React',
    description: 'A custom hook to handle Supabase authentication state across your application.',
    language: 'TypeScript',
    code_content: `export function useAuth() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // ...
  }, []);
  
  return { user };
}`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'John Doe',
      email: 'john@example.com'
    }
  },
  {
    id: 'mock-2',
    user_id: 'mock-user-2',
    title: 'CSS Glassmorphism Card',
    description: 'A simple CSS class to create a frosted glass effect for cards.',
    language: 'CSS',
    code_content: `.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}`,
    preview_image_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Sarah Smith',
      email: 'sarah@example.com'
    }
  },
  {
    id: 'mock-3',
    user_id: 'mock-user-3',
    title: 'Python Data Processor',
    description: 'Script to parse CSV data and calculate averages.',
    language: 'Python',
    code_content: `import csv

def process_data(file_path):
    with open(file_path, 'r') as file:
        reader = csv.reader(file)
        data = [int(row[1]) for row in reader if row[1].isdigit()]
    return sum(data) / len(data) if data else 0`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Alex Johnson',
      email: 'alex@example.com'
    }
  },
  {
    id: 'mock-4',
    user_id: 'mock-user',
    title: 'Quick Sort Algorithm',
    description: 'Classic quick sort implementation in JavaScript.',
    language: 'JavaScript',
    code_content: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[arr.length - 1];
  const left = [];
  const right = [];
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] < pivot) left.push(arr[i]);
    else right.push(arr[i]);
  }
  return [...quickSort(left), pivot, ...quickSort(right)];
}`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'John Doe',
      email: 'john@example.com'
    }
  },
  {
    id: 'mock-5',
    user_id: 'mock-user-4',
    title: 'SQL CTE Example',
    description: 'Using Common Table Expressions to simplify complex queries.',
    language: 'SQL',
    code_content: `WITH RegionalSales AS (
    SELECT region, SUM(amount) AS total_sales
    FROM orders
    GROUP BY region
),
TopRegions AS (
    SELECT region
    FROM RegionalSales
    WHERE total_sales > (SELECT SUM(total_sales)/10 FROM RegionalSales)
)
SELECT region, product, SUM(amount) AS product_sales
FROM orders
WHERE region IN (SELECT region FROM TopRegions)
GROUP BY region, product;`,
    preview_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 84).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Data Guru',
      email: 'data@example.com'
    }
  },
  {
    id: 'mock-6',
    user_id: 'mock-user-5',
    title: 'Bash Script Builder',
    description: 'A helpful script to bootstrap structural folders.',
    language: 'Bash',
    code_content: `#!/bin/bash
PROJECT_NAME=$1
mkdir -p $PROJECT_NAME/{src/{components,pages,hooks,lib},public,assets}
touch $PROJECT_NAME/src/index.tsx
echo "Project $PROJECT_NAME scaffolded!"`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'DevOps Dave',
      email: 'dave@example.com'
    }
  },
  {
    id: 'mock-7',
    user_id: 'mock-user-6',
    title: 'Rust Error Handling',
    description: 'Pattern matching and Result propagation in Rust.',
    language: 'Rust',
    code_content: `use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut s = String::new();
    File::open("hello.txt")?.read_to_string(&mut s)?;
    Ok(s)
}`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Rusty',
      email: 'rust@example.com'
    }
  },
  {
    id: 'mock-8',
    user_id: 'mock-user-7',
    title: 'Go Concurrent Fetcher',
    description: 'Fetching multiple URLs concurrently using goroutines.',
    language: 'Go',
    code_content: `package main

import (
	"fmt"
	"net/http"
	"sync"
)

func fetch(url string, wg *sync.WaitGroup) {
	defer wg.Done()
	res, err := http.Get(url)
	if err != nil {
		fmt.Println("Error:", url)
		return
	}
	fmt.Println(url, res.Status)
}

func main() {
	var wg sync.WaitGroup
	urls := []string{"http://google.com", "http://github.com"}
	for _, u := range urls {
		wg.Add(1)
		go fetch(u, &wg)
	}
	wg.Wait()
}`,
    preview_image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000&auto=format&fit=crop',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Gopher',
      email: 'go@example.com'
    }
  },
  {
    id: 'mock-9',
    user_id: 'mock-user',
    title: 'React Router Setup',
    description: 'Basic routing setup for a React SPA.',
    language: 'React',
    code_content: `import { BrowserRouter, Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'John Doe',
      email: 'john@example.com'
    }
  },
  {
    id: 'mock-10',
    user_id: 'mock-user-2',
    title: 'HTML 5 Template',
    description: 'Standard HTML5 boilerplate.',
    language: 'HTML',
    code_content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`,
    preview_image_url: null,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
    updated_at: new Date().toISOString(),
    profiles: {
      display_name: 'Sarah Smith',
      email: 'sarah@example.com'
    }
  }
];
