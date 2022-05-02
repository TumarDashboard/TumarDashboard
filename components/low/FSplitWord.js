import React from 'react'
import { motion } from 'framer-motion'

export function FSplitWord({ children, ...rest }) {

    let characters = children.split('');

    return characters.map((character, i) => {
        // console.log(word + i);
        return (
            <motion.span
                key={children + i}
                custom={i}
                {...rest}
            >
                {/* {word + (i !== words.length - 1 ? '\u00A0' : '')} */}
                {character==' '?'\u00A0':character}
            </motion.span>
        )
    })

}