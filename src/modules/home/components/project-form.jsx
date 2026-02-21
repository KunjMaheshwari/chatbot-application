"use client";

import React from 'react'
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import TextAreaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { useState } from 'react';
import z from "zod";

import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import { Form, FormField } from "@/components/ui/form";

const formSchema = z.object({
    content: z.string().min(1, "Project description required").max(1000, "Description is too long!!")
})

const PROJECT_TEMPLATES = [
    {
        emoji: "📽️",
        title: "Build a Netflix clone",
        prompt:
            "Build a Netflix-style homepage with a hero banner (use a nice, dark-mode compatible gradient), movie sections, responsive cards, and a modal for viewing details using mock data and local state. Use dark mode.",
    },
    {
        emoji: "📊",
        title: "Create a SaaS Analytics Dashboard",
        prompt:
            "Build a modern SaaS analytics dashboard with sidebar navigation, KPI cards, charts (line + bar), a recent activity table, and a dark/light mode toggle. Use clean spacing, smooth animations, and a professional UI.",
    },
    {
        emoji: "🤖",
        title: "Build an AI Chat Interface",
        prompt:
            "Create a sleek AI chatbot interface with a message list, typing animation, input field, and conversation history panel. Include a dark theme, smooth scroll behavior, and a responsive mobile layout.",
    },
    {
        emoji: "🛒",
        title: "Create an E-commerce Storefront",
        prompt:
            "Build a modern e-commerce homepage with a hero section, featured products grid, product filters (category + price), shopping cart sidebar, and responsive design. Use clean UI and subtle hover effects.",
    },
    {
        emoji: "📅",
        title: "Design a Productivity Planner App",
        prompt:
            "Build a productivity planner app with a task list, drag-and-drop task reordering, priority labels, calendar view, and progress tracking. Use a minimal, distraction-free interface.",
    },
    {
        emoji: "🌐",
        title: "Create a Social Media Feed",
        prompt:
            "Build a social media feed UI with posts, likes, comments, a sticky top navigation bar, profile sidebar, and responsive layout. Include dark mode styling and smooth interaction states.",
    },
    {
        emoji: "💬",
        title: "Build a Real-Time Chat App",
        prompt:
            "Create a real-time chat application UI with a sidebar for conversations, active user indicators, message bubbles, typing status, and a responsive mobile layout. Use a modern dark theme with smooth transitions.",
    },
    {
        emoji: "💰",
        title: "Design a Personal Finance Tracker",
        prompt:
            "Build a personal finance tracker dashboard with income and expense forms, categorized transaction list, summary cards (total balance, income, expenses), and interactive charts. Use a clean dark UI with subtle gradients.",
    },
];

const ProjectForm = () => {
    const [isFocused, setIsFocused] = useState(false);
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            content: ""
        }
    })

    const handleTemplate = (prompt) => {
        form.setValue("content", prompt);
    }

    const onSubmit = async (values) => {
        try {
            console.log(values);
        } catch (error) {

        }
    }

    return (
        <div className='space-y-8'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
                {
                    PROJECT_TEMPLATES.map((template, index) => (
                        <button
                            key={index}
                            onClick={() => handleTemplate(template.prompt)}
                            //disabled{isPending}
                            className='group relative p-4 rounded-xl border bg-card hover::bg-accent/50
                transition-all duration-200 text-left disabled:opacity-50
                disabled:cursor-not-allowed hover:shadow-md hover:border-primary/30' >
                            <div className='flex flex-col gap-2'>
                                <span className='text-3xl' role='img' aria-label={template.title}>
                                    {template.emoji}
                                </span>
                                <h3 className='text-sm font-medium group-hover:text-primary transition-colors'>
                                    {template.title}
                                </h3>
                            </div>
                            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5
                    to-transparent opacity-0 group-hover:opacity-100 transition-opacity
                    pointer-events-none' />
                        </button>
                    ))
                }
            </div>

            <div className='relative'>
                <div className='absolute inset-0 flex items-center'>
                    <span className='w-full border-t' />
                </div>
                <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-background px-2 text-muted-foreground'>
                        or describe your own idea
                    </span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}
                    className={cn("relative border p-4 pt-1 rounded-xl bg-slider dark:bg-sidebar transition - all",
                        isFocused && "shadow-lg ring-2 ring-primary/20"
                    )}>
                    <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                            <TextAreaAutosize
                                {...field}
                                //disabled={isPending}
                                placeholder='Describe what you want to create...'
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                minRows={3}
                                maxRows={8}
                                className={cn(
                                    "pt-4 resize-none border-none w-full outline-none bg-transparent",
                                    //isPending && "opacity-50"
                                )}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                                        e.preventDefault();
                                        form.handleSubmit(onSubmit)(e);
                                    }
                                }}
                            />
                        )}
                    />

                    <div className='flex gap-x-2 items-end justify-between pt-2'>
                        <div className='text-[10px] text-muted-foreground font-mono'>
                            <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none
                            items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px]
                            font-medium text-muted-foreground'>
                                <span>&#8984;</span>Enter
                            </kbd>
                            &nbsp; to submit
                        </div>
                        <Button className={cn("size-8 rounded-full")}
                        type="submit">
                            <ArrowUpIcon className='size-4' />
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    )
}

export default ProjectForm
