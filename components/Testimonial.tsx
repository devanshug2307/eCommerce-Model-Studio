import React from 'react';

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  company?: string;
  avatar?: string;
  rating?: number;
}

const Testimonial: React.FC<TestimonialProps> = ({
  quote,
  author,
  role,
  company,
  avatar,
  rating = 5
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-deep-teal/30 transition-all duration-300 h-full flex flex-col shadow-sm hover:shadow-md">
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg
            key={i}
            className="w-5 h-5 text-yellow-500 fill-current"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 text-base leading-relaxed mb-6 flex-grow italic">
        "{quote}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
        {avatar ? (
          <img
            src={avatar}
            alt={author}
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-deep-teal flex items-center justify-center text-white font-bold text-lg">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <div className="font-semibold text-rich-black">{author}</div>
          <div className="text-sm text-gray-500">
            {role}{company && ` · ${company}`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonial;
