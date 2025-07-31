import React, { useState } from 'react';
import { 
  Leaf, 
  Info, 
  AlertTriangle, 
  Heart, 
  Droplets, 
  Sun, 
  ChevronDown, 
  ChevronUp,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

const PlantResult = ({ data, timestamp }) => {
  const [expandedSections, setExpandedSections] = useState({
    taxonomy: false,
    benefits: false,
    warnings: false,
    care: false
  });
  const [copied, setCopied] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = async () => {
    const text = `Plant Identification Result:
Common Name: ${data.commonName}
Scientific Name: ${data.scientificName}
Confidence: ${(data.confidence * 100).toFixed(1)}%

Taxonomy:
- Species: ${data.species}
- Genus: ${data.genus}
- Family: ${data.family}
- Order: ${data.order}
- Class: ${data.class}
- Division: ${data.division}
- Kingdom: ${data.kingdom}

Benefits:
${data.goodSides?.map(side => `- ${side}`).join('\n') || 'None listed'}

Warnings:
${data.badSides?.map(side => `- ${side}`).join('\n') || 'None listed'}

Care Instructions:
${data.careInstructions || 'Not available'}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  if (data.error) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-3xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="text-red-600" size={20} />
            <span className="font-medium text-red-800 dark:text-red-200">
              Identification Failed
            </span>
          </div>
          <p className="text-red-700 dark:text-red-300">{data.error}</p>
          {timestamp && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">
              {formatTimestamp(timestamp)}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end mb-4">
      <div className="max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Leaf className="text-green-600 dark:text-green-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Plant Identified
                </h3>
                {timestamp && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(timestamp)}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={copyToClipboard}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              title="Copy result"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Plant Image */}
        {data.image && (
          <div className="p-4">
            <img 
              src={data.image} 
              alt={data.commonName}
              className="w-full max-w-sm mx-auto rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Main Information */}
        <div className="p-4">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {data.commonName}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 italic">
              {data.scientificName}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(data.confidence)}`}>
                {(data.confidence * 100).toFixed(1)}% confidence
              </span>
              {data.note && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  {data.note}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {data.description && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {data.description}
              </p>
              {data.url && (
                <a 
                  href={data.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm mt-2"
                >
                  Learn more <ExternalLink size={12} />
                </a>
              )}
            </div>
          )}

          {/* Taxonomy */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('taxonomy')}
              className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Info size={16} className="text-gray-600 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Taxonomy
                </span>
              </div>
              {expandedSections.taxonomy ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {expandedSections.taxonomy && (
              <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Kingdom:</strong> {data.kingdom}</div>
                  <div><strong>Division:</strong> {data.division}</div>
                  <div><strong>Class:</strong> {data.class}</div>
                  <div><strong>Order:</strong> {data.order}</div>
                  <div><strong>Family:</strong> {data.family}</div>
                  <div><strong>Genus:</strong> {data.genus}</div>
                  <div><strong>Species:</strong> {data.species}</div>
                </div>
              </div>
            )}
          </div>

          {/* Benefits */}
          {data.goodSides && data.goodSides.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('benefits')}
                className="flex items-center justify-between w-full p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-green-600 dark:text-green-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Benefits & Uses
                  </span>
                </div>
                {expandedSections.benefits ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {expandedSections.benefits && (
                <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <ul className="space-y-2">
                    {data.goodSides.map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {data.badSides && data.badSides.length > 0 && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('warnings')}
                className="flex items-center justify-between w-full p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Warnings & Precautions
                  </span>
                </div>
                {expandedSections.warnings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {expandedSections.warnings && (
                <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <ul className="space-y-2">
                    {data.badSides.map((warning, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                        <span className="text-gray-700 dark:text-gray-300">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Care Instructions */}
          {data.careInstructions && (
            <div className="mb-4">
              <button
                onClick={() => toggleSection('care')}
                className="flex items-center justify-between w-full p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Droplets size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Care Instructions
                  </span>
                </div>
                {expandedSections.care ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {expandedSections.care && (
                <div className="mt-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {data.careInstructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantResult;

