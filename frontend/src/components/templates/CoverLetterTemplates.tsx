import React from "react";

export type CoverLetterTemplate = "professional" | "modern" | "formal";

interface CoverLetterTemplateProps {
    content: string;
    template: CoverLetterTemplate;
    applicantName: string;
    companyName?: string;
    position?: string;
}

export const CoverLetterTemplateComponent: React.FC<CoverLetterTemplateProps> = ({ 
    content, 
    template, 
    applicantName,
    companyName,
    position 
}) => {
    switch (template) {
        case "professional":
            return <ProfessionalTemplate content={content} applicantName={applicantName} companyName={companyName} position={position} />;
        case "modern":
            return <ModernTemplate content={content} applicantName={applicantName} companyName={companyName} position={position} />;
        case "formal":
            return <FormalTemplate content={content} applicantName={applicantName} companyName={companyName} position={position} />;
        default:
            return <ProfessionalTemplate content={content} applicantName={applicantName} companyName={companyName} position={position} />;
    }
};

// Professional Template - Standard business format
const ProfessionalTemplate: React.FC<{
    content: string;
    applicantName: string;
    companyName?: string;
    position?: string;
}> = ({ content, applicantName, companyName, position }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto">
            {/* Header with contact info */}
            <header className="mb-8 text-right">
                <div className="text-sm text-slate-600 space-y-1">
                    <div>{applicantName}</div>
                    <div>Email • Phone • Location</div>
                </div>
            </header>

            {/* Date */}
            <div className="mb-8 text-sm text-slate-600">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Recipient */}
            {companyName && (
                <div className="mb-4 text-sm text-slate-700">
                    <div>{companyName}</div>
                    {position && <div>{position}</div>}
                    <div>Company Address</div>
                </div>
            )}

            {/* Salutation */}
            <div className="mb-4 text-sm text-slate-700">
                Dear Hiring Manager,
            </div>

            {/* Content */}
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap space-y-4">
                {content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                ))}
            </div>

            {/* Closing */}
            <div className="mt-8 space-y-2">
                <div className="text-sm text-slate-700">Sincerely,</div>
                <div className="text-sm font-semibold text-slate-900">{applicantName}</div>
            </div>
        </div>
    );
};

// Modern Template - Clean with accent color
const ModernTemplate: React.FC<{
    content: string;
    applicantName: string;
    companyName?: string;
    position?: string;
}> = ({ content, applicantName, companyName, position }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto">
            {/* Header with colored accent */}
            <header className="mb-8 pb-6 border-b-4 border-blue-600">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{applicantName}</h1>
                <div className="text-xs text-slate-500">Email • Phone • Location</div>
            </header>

            {/* Date and recipient */}
            <div className="mb-8 space-y-2 text-sm">
                <div className="text-slate-600">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
                {companyName && (
                    <div className="text-slate-700 font-semibold">
                        {companyName}
                        {position && ` • ${position}`}
                    </div>
                )}
            </div>

            {/* Salutation */}
            <div className="mb-6 text-base font-medium text-slate-900">
                Dear Hiring Manager,
            </div>

            {/* Content */}
            <div className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap space-y-5">
                {content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="first-line:font-medium">{paragraph}</p>
                ))}
            </div>

            {/* Closing */}
            <div className="mt-10 space-y-2">
                <div className="text-base text-slate-700">Best regards,</div>
                <div className="text-lg font-bold text-blue-600">{applicantName}</div>
            </div>
        </div>
    );
};

// Formal Template - Traditional format
const FormalTemplate: React.FC<{
    content: string;
    applicantName: string;
    companyName?: string;
    position?: string;
}> = ({ content, applicantName, companyName, position }) => {
    return (
        <div className="bg-white text-slate-900 p-12 min-h-[1123px] w-full max-w-[794px] mx-auto border-2 border-slate-300">
            {/* Header */}
            <header className="mb-10 text-center border-b-2 border-slate-300 pb-4">
                <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">{applicantName}</h1>
                <div className="text-xs text-slate-600">Email | Phone | Location</div>
            </header>

            {/* Date */}
            <div className="mb-6 text-sm text-slate-700">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>

            {/* Recipient */}
            {companyName && (
                <div className="mb-6 text-sm text-slate-700">
                    <div className="font-semibold">{companyName}</div>
                    {position && <div>{position}</div>}
                    <div>Company Address</div>
                    <div>City, State ZIP</div>
                </div>
            )}

            {/* Salutation */}
            <div className="mb-6 text-sm text-slate-700">
                Dear Sir or Madam,
            </div>

            {/* Content */}
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap space-y-4 indent-4">
                {content.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="text-justify">{paragraph}</p>
                ))}
            </div>

            {/* Closing */}
            <div className="mt-10 space-y-3">
                <div className="text-sm text-slate-700">Respectfully yours,</div>
                <div className="text-sm font-bold text-slate-900">{applicantName}</div>
            </div>
        </div>
    );
};

export default CoverLetterTemplateComponent;

