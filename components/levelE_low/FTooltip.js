import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { usePopper } from 'react-popper';

const tooltipMotion = {
    initial: {
        opacity: 0,
        transitionEnd: {
            display: "none",
        },
    },
    animate: {
        opacity: 1,
        display: "block"
    },
};

export function FTooltip({ reference }) {
    const [isOpen, setIsOpen] = useState(false);

    const [referenceElement, setReferenceElement] = useState(null);
    const [referenceText, setReferenceText] = useState(null);

    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        placement: 'left-start',
        modifiers: [
            {
                name: 'offset',
                options: {
                    offset: [0, -2],
                },
            },
            {
                name: 'flip',
                enabled: false,
            },
        ],
    });

    let enterTimeout = useRef();
    let leaveTimeout = useRef();
    
    useEffect(()=>{
        if( reference ){
            setReferenceElement(reference.target);
            setReferenceText(reference.text)
            leaveTimeout.current && clearTimeout(leaveTimeout.current);
            enterTimeout.current = setTimeout(() => setIsOpen(true), 250);
        }else{
            enterTimeout.current && clearTimeout(enterTimeout.current);
            leaveTimeout.current = setTimeout(() => setIsOpen(false), 150);
        }
    }, [reference]);

    return (
        <motion.div
            variants={tooltipMotion}
            animate={isOpen ? "animate" : "initial"}
        >
            <div
                ref={setPopperElement}
                style={styles.popper}
                {...attributes.popper}
                className={`bg-red-700 z-10 text-color_G text-sm px-2 h-[34px] rounded-lg select-none items-center flex`}
            >
                {referenceText}
            </div>
        </motion.div>
    )

}