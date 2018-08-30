/**
 * Gatsby's Node APIs in this file.
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const path = require('path')

const createTagPages = (createPage, posts) => {
  const tagPageTemplate = path.resolve('./src/components/tags.js')
  const allTagsTemplate = path.resolve('./src/components/all-tags.js')

  const postsByTags = {}

  posts.forEach(({ node }) => {
    const tags = node.frontmatter.tags
    if (tags && tags.length) {
      tags.forEach(tag => {
        if (!postsByTags[tag]) {
          postsByTags[tag] = []
        }

        postsByTags[tag].push(node)
      })
    }
  })

  const tagList = Object.keys(postsByTags)

  createPage({
    path: '/tags',
    component: allTagsTemplate,
    context: {
      tags: tagList.sort()
    }
  })

  tagList.forEach(tagName => {
    const posts = postsByTags[tagName]

    createPage({
      path: `/tags/${tagName}`,
      component: tagPageTemplate,
      context: {
        posts,
        tagName
      }
    })
  })
}

exports.createPages = async ({ boundActionCreators, graphql }) => {
  const { createPage } = boundActionCreators
  const blogPostTemplate = path.resolve('./src/components/blog-post.js')

  try {
    const result = await graphql(`{
      allMarkdownRemark {
        edges {
          node {
            html
            id
            frontmatter {
              date
              path
              title
              excerpt
              tags
            }
          }
        }
      }
    }`) 

    const posts = result.data.allMarkdownRemark.edges

    debugger

    createTagPages(createPage, posts)

    return posts.forEach(({ node }, index) => {
      createPage({
        path: node.frontmatter.path,
        component: blogPostTemplate,
        context: ({
          prev: index === 0 ? null : posts[index - 1].node,
          next: index === (posts.length - 1) ? null : posts[index + 1].node
        })
      })
    })
  } catch (error) {
    debugger
    // TODO handle this more gracefully
    throw error
  }
}