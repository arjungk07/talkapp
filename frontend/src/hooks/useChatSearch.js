import { useMemo, useRef, useState, useEffect } from "react";

export const useChatSearch = (messages) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

    const messageRefs = useRef({});

    const matches = useMemo(() => {
        if (!searchQuery.trim()) return [];

        return messages.filter((msg) =>
            msg.text
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase())
        );
    }, [messages, searchQuery]);

    const scrollToMatch = (index) => {
        const match = matches[index];

        if (!match) return;

        const element =
            messageRefs.current[match._id];

        element?.scrollIntoView({
            behavior: "auto",
            block: "center",
        });
    };


    // useEffect(() => {
    //     setCurrentMatchIndex(0);

    //     if (matches.length) {
    //         setTimeout(() => {
    //             scrollToMatch(0);
    //         }, 50);
    //     }
    // }, [searchQuery]);

    const nextMatch = () => {
        if (!matches.length) return;

        const next =
            (currentMatchIndex + 1) %
            matches.length;

        setCurrentMatchIndex(next);

        scrollToMatch(next);
    };

    const prevMatch = () => {
        if (!matches.length) return;

        const prev =
            (currentMatchIndex - 1 + matches.length) %
            matches.length;

        setCurrentMatchIndex(prev);

        scrollToMatch(prev);
    };

    const registerMessageRef = (
        id,
        element
    ) => {
        if (element) {
            messageRefs.current[id] = element;
        }
    };

    

    return {
        searchQuery,
        setSearchQuery,
        currentMatchIndex,
        totalMatches: matches.length,
        nextMatch,
        prevMatch,
        registerMessageRef,
    };
};