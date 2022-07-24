import React from 'react'
import { motion } from 'framer-motion'

export function FSplitWord({ children, ...rest }) {

    let characters = children.split('');

    return characters.map((character, i) => {
        return (
            <motion.span
                key={children + i}
                custom={i}
                {...rest}
            >
                {character==' '?'\u00A0':character}
            </motion.span>
        )
    })

}